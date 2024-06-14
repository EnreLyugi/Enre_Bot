const { Guild_vars } = require("../../includes/tables.js");
const { registerUser } = require("../../includes/functions.js");
const { PermissionsBitField } = require("discord.js");
const { default_color } = require("../../config.json");

const defcolor = default_color;

const musicCommandVariants = [
  "play",
  "p",
  "playlist",
  "skip",
  "stop",
  "parar",
  "loop",
  "volume",
  "seek",
  "clearqueue",
  "shuffle",
  "misturar",
  "queue",
  "fila",
  "getvolume",
  "nowplaying",
  "tocando",
  "pause",
  "pausar",
  "resume",
  "continuar",
  "remove",
  "createprogressbar",
  "autoshuffle"
];

const onMessageCreate = async (client, sequelize, message) => {
    let user = message.author; //Message author data
    if (user.bot) return; //check if the user is a bot
  
    await registerUser(user, message.guild); //Checks if user is registered on DB case not, it will register
  
    //SELECT FROM Guild_vars WHERE guild_id = message.guild.id
    let guild_vars = await Guild_vars.findAll({
      where: {
        guild_id: message.guild.id,
      },
    });
  
    if (!guild_vars[0]) {
      guild_vars = await Guild_vars.create({
        guild_id: message.guild.id,
      });
  
      guild_vars[0] = guild_vars.dataValues;
    }
  
    let prefix = guild_vars[0].prefix; //Gets Guild's prefix setting
    let language = guild_vars[0].language; //Gets guild's lannguage setting
    const localization = await require(`../../localization/${language}.json`); //Localization file based on guild's language
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
  
    let command = args.shift().toLowerCase();
    let logText = "";
    let logType = 0;
    try {
      if (message.content.indexOf(prefix) == 0) {
        process.stdout.write(
          `\x1b[34m${message.author.username}: \x1b[0m${message.content} \x1b[33m<= (${message.guild.name})`
        );
        logText = `${message.author.username}: ${message.content} <= (${message.guild.name})`;
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) return;
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks || PermissionsBitField.Flags.ReadMessageHistory)
         || !message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.ReadMessageHistory)) 
          return message.channel.send(localization.REQUIRE_CLIENT_EMBED_LINKS_AND_READ_MESSAGE_HISTORY_PERMISSION);
      }
      if (message.content.indexOf(prefix) !== 0) {
        let commands = require(`../../noPrefix.js`);
        return commands.run({ client, prefix, localization, message, args, sequelize, defcolor });
      }

      if (musicCommandVariants.includes(command)) {
        let commands = require(`../../commands/music.js`);
        return commands.run({ client, prefix, localization, message, args, defcolor, command });
      }

      if (command == "ativarxp" || command == "enablexp") {
        let commands = require(`../../commands/enablexp.js`);
        return commands.run({ client, prefix, localization, message, args, sequelize, defcolor, command });
      }

      if (message.author.id == "1245127937259208808" && command == "queues") {
          if (client.player.queues.size > 0) {
            console.log(`\n\nServidores com Fila:`);
            let list = `Servidores com Fila:\n`;
            client.player.queues.forEach(async (queue) => {
              console.log(
                `\x1b[34m%s\x1b[33m%s\x1b[0m`,
                `${queue.guild.name} `,
                `(${queue.guild.id}) <= ${queue.paused}`
              );
              list =
                list +
                `\n${queue.guild.name} (${queue.guild.id}) <= ${queue.paused}`;
            });
            return message.reply(list);
          } else {
            return message.reply(`Não há filas no momento!`);
          }
      }

      let commands = require(`../../commands/${command}.js`);
      return commands.run({ client, prefix, localization, message, args, sequelize, defcolor });
    } catch (e) {
      process.stdout.write(`\x1b[31m <= ${e.message}`);
      logText = logText + ` <= \`${e.message}\``;
      logType = 1;
    } finally {
      if (message.content.indexOf(prefix) == 0) {
        console.log(`\x1b[0m`);
        client.guilds.cache
          .get("1249736903691997275")
          .channels.resolve((logType == 0) ? "1249909155951542303" : "1249912703594664027")
          .send(logText);
      }
    }
}

module.exports = onMessageCreate;