const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const handlebars = require("express-handlebars");
const { Client, Intents } = require("discord.js");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Guild_vars } = require("../includes/tables.js");

const sequelize = require("../includes/db.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});

const credentials = {
  key: fs.readFileSync(`${process.env.PRIVATEKEY}`),
  cert: fs.readFileSync(`${process.env.CERTIFICATE}`),
};
const port = process.env.PORT;

(async () => {
  await sequelize
    .authenticate()
    .then(function () {
      console.log(`\x1b[32m%s\x1b[0m`, `Conectado ao banco de dados!`);
    })
    .catch(function (err) {
      console.log(
        `\x1b[31m%s\x1b[0m`,
        `Falha ao se conectar ao banco de dados!`
      );
      console.log(`\x1b[31m%s\x1b[0m`, err);
      process.exit();
    });

  await sequelize
    .sync()
    .then(function () {
      console.log(`\x1b[32m%s\x1b[0m`, `Tabelas sincronizadas!`);
    })
    .catch(function (err) {
      console.log(`\x1b[31m%s\x1b[0m`, err);
    });

  https.createServer(credentials, app).listen(process.env.PORT, () => {
    console.log(`HTTPS running port ${port}`);
  });

  app.engine(
    "handlebars",
    handlebars({
      defaultLayout: "main",
      helpers: {
        ifEquals: function (arg1, arg2, options) {
          return arg1 == arg2 ? options.fn(this) : options.inverse(this);
        },
      },
    })
  );
  app.set("view engine", "handlebars");
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.CLIENTID,
        clientSecret: process.env.SECRET,
        callbackURL: "https://enrebot.enrelyugi.com.br/auth/discord/callback",
        scope: ["identify", "guilds"],
      },
      function (accessToken, refreshToken, profile, done) {
        done(null, profile);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  app.get("/auth/discord", passport.authenticate("discord"));

  app.get(
    "/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/servers");
    }
  );

  app.get("/servers", function (req, res) {
    if (!req.user) {
      return res.redirect("/");
    }

    let user = client.users.resolve(req.user.id);
    if (!user) {
      res.send("usuário não encontrado");
      return;
    }

    let guilds = client.guilds.cache.filter((guild) => {
      let member = guild.members.resolve(user.id);
      return member && member.permissions.has("ADMINISTRATOR");
    });

    const guildInfo = guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      members: guild.members.cache.size,
      iconURL: guild.iconURL({ dynamic: true }) || null,
      initials: guild.nameAcronym || null,
    }));
    res.render("servers", { guilds: guildInfo });
  });

  app.get("/server/:id", async function (req, res) {
    if (!req.user) {
      return res.redirect("/");
    }

    let guild = await client.guilds.resolve(req.params.id);
    if (!guild) {
      return res.redirect("/servers");
    }

    Guild_vars.findOne({
      where: { guild_id: guild.id },
    })
      .then((guildVars) => {
        if (!guildVars) {
          guildVars = {
            prefix: ".",
            auto_shuffle: false,
            language: "english",
          };
        }

        const channelsInfo = guild.channels.cache
          .filter((channel) => channel.type === "GUILD_TEXT")
          .map((channel) => ({
            id: channel.id,
            name: channel.name,
          }));

        const rolesInfo = guild.roles.cache.map((role) => ({
          id: role.id,
          name: role.name,
          color: role.color.toString(16),
        }));

        channelsInfo.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

        rolesInfo.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

        res.render("server", {
          id: guildVars.guild_id,
          name: guild.name,
          iconURL: guild.iconURL({ dynamic: true }) || null,
          initials: guild.nameAcronym || null,
          prefix: guildVars.prefix,
          welcome_chat: guildVars.welcome_chat,
          exit_chat: guildVars.exit_chat,
          log_chat: guildVars.log_chat,
          muted_role: guildVars.muted_role,
          join_role: guildVars.join_role,
          auto_shuffle: guildVars.auto_shuffle,
          language: guildVars.language,
          chats: channelsInfo,
          roles: rolesInfo,
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Ocorreu um erro ao buscar as configurações.");
      });
  });

  app.post("/server/:id", (req, res) => {
    const guild_id = req.params.id;

    const {
      prefix,
      welcome_chat,
      exit_chat,
      log_chat,
      muted_role,
      join_role,
      auto_shuffle,
      language,
    } = req.body;

    Guild_vars.update(
      {
        prefix,
        welcome_chat,
        exit_chat,
        log_chat,
        muted_role,
        join_role,
        auto_shuffle: !!auto_shuffle,
        language,
      },
      {
        where: { guild_id },
      }
    )
      .then(() => {
        res.status(200).json({ sucesso: true, message: "dados atualizados!" });
      })
      .catch((error) => {
        console.error(error);
        res.status(401).json({
          sucesso: false,
          message: "Ocorreu um erro ao atualizar as configurações.",
        });
      });
  });

  app.get("/", function (req, res) {
    if (req.user) {
      return res.redirect("/servers");
    }
    res.render("index");
  });
})();

client.on("ready", () => {
  console.log("Bot Conectado!");
});

client.login(process.env.TOKEN);
