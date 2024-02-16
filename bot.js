const { Client, GatewayIntentBits } = require("discord.js");
const Discord = require("discord.js");
const config = require("./config.json");
const cooldown = require("./includes/cooldown.js");
const Canvas = require("canvas");
const { registerUser, paginate } = require("./includes/functions.js");
require("dotenv").config();
require("./rest.js");

Font = Canvas.registerFont;
new Font("./fonts/edosz.ttf", { family: "edosz" });

let defcolor = config.default_color;

//Sequelize
const { Op } = require("sequelize");
const sequelize = require("./includes/db.js");

//Import Tables
const {
  Guild_vars,
  Users,
  Users_level,
  Colors,
  Color_inventory,
  Xp_channels,
  Xp_roles,
  Vip_role,
} = require("./includes/tables.js");

//Discord Intents
const client = new Client({
  intents: [
    GatewayIntentBits.GUILDS,
    GatewayIntentBits.GUILD_MESSAGES,
    GatewayIntentBits.GUILD_VOICE_STATES,
    GatewayIntentBits.GUILD_MEMBERS,
    GatewayIntentBits.GUILD_BANS,
    GatewayIntentBits.GUILD_EMOJIS_AND_STICKERS,
    GatewayIntentBits.GUILD_INTEGRATIONS,
    GatewayIntentBits.GUILD_WEBHOOKS,
    GatewayIntentBits.GUILD_INVITES,
    GatewayIntentBits.GUILD_PRESENCES,
    GatewayIntentBits.GUILD_MESSAGE_REACTIONS,
    GatewayIntentBits.GUILD_MESSAGE_TYPING,
    GatewayIntentBits.DIRECT_MESSAGES,
    GatewayIntentBits.DIRECT_MESSAGE_REACTIONS,
    GatewayIntentBits.DIRECT_MESSAGE_TYPING,
  ],
});

//Load music player
const { Player } = require("discord-music-player");
const player = new Player(client, {
  leaveOnEmpty: true,
  leaveOnStop: true,
  leaveOnEnd: true
});

//Set the player into client
client.player = player;

//Triggered when bot hets online
client.on("ready", async () => {
  console.log(
    `\x1b[34m%s\x1b[0m`,
    `\nBot iniciado!\n\nUsers: ${client.users.cache.size} \nServidores: ${client.guilds.cache.size}\n`
  );

  let serverList = '';

  client.guilds.cache.forEach(guild => {
    serverList += guild.name + '\n';
  });

  client.guilds.cache
    .get("1063595350792876092")
    .channels.resolve("1130931325323452416")
    .send(`\nBot iniciado!\n\nUsers: ${client.users.cache.size} \nServidores: ${client.guilds.cache.size}\n\n${serverList}\n`);

  client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
    type: "PLAYING",
  }); //User activty

  //authenticate sequelize connection to DB
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
      process.exit(); //Close program if DB connection failed
    });

  //Sync DB tables with tables.js
  await sequelize
    .sync()
    .then(function () {
      console.log(`\x1b[32m%s\x1b[0m`, `Tabelas sincronizadas!`);
    })
    .catch(function (err) {
      console.log(`\x1b[31m%s\x1b[0m`, err);
    });
});

//Triggered when messages are received
client.on("messageCreate", async (message) => {
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
  const localization = await require(`./localization/${language}.json`); //Localization file based on guild's language
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
      if (
        !message.guild.me
          .permissionsIn(message.channel)
          .has(Discord.Permissions.FLAGS.SEND_MESSAGES)
      )
        return;
      if (
        !message.guild.me
          .permissionsIn(message.channel)
          .has(Discord.Permissions.FLAGS.EMBED_LINKS) ||
        !message.guild.me
          .permissionsIn(message.channel)
          .has(Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY)
      )
        return message.channel.send(
          localization.REQUIRE_CLIENT_EMBED_LINKS_AND_READ_MESSAGE_HISTORY_PERMISSION
        );
    }
    if (message.content.indexOf(prefix) !== 0) {
      let commands = require(`./noPrefix.js`);
      commands.run(
        client,
        prefix,
        localization,
        message,
        args,
        sequelize,
        defcolor
      );
      return;
    } else if (
      command == "play" ||
      command == "p" ||
      command == "playlist" ||
      command == "skip" ||
      command == "stop" ||
      command == "parar" ||
      command == "loop" ||
      command == "volume" ||
      command == "seek" ||
      command == "clearqueue" ||
      command == "shuffle" ||
      command == "misturar" ||
      command == "queue" ||
      command == "fila" ||
      command == "getvolume" ||
      command == "nowplaying" ||
      command == "tocando" ||
      command == "pause" ||
      command == "pausar" ||
      command == "resume" ||
      command == "continuar" ||
      command == "remove" ||
      command == "createprogressbar" ||
      command == "autoshuffle"
    ) {
      let commands = require(`./commands/music.js`);
      commands.run(
        client,
        prefix,
        localization,
        message,
        args,
        sequelize,
        defcolor,
        command
      );
    } else if (command == "ativarxp" || command == "enablexp") {
      let commands = require(`./commands/enablexp.js`);
      commands.run(
        client,
        prefix,
        localization,
        message,
        args,
        sequelize,
        defcolor,
        command
      );
    } else if (message.author.id == "308028890213777418") {
      if (command == "queues") {
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
          message.reply(list);
        } else {
          message.reply(`Não há filas no momento!`);
        }
      } else {
        let commands = require(`./commands/${command}.js`);
        commands.run(
          client,
          prefix,
          localization,
          message,
          args,
          sequelize,
          defcolor
        );
      }
    } else {
      let commands = require(`./commands/${command}.js`);
      commands.run(
        client,
        prefix,
        localization,
        message,
        args,
        sequelize,
        defcolor
      );
    }
  } catch (e) {
    process.stdout.write(`\x1b[31m <= ${e.message}`);
    logText = logText + ` <= \`${e.message}\``;
    logType = 1;
  } finally {
    if (message.content.indexOf(prefix) == 0) {
      console.log(`\x1b[0m`);
      client.guilds.cache
        .get("1063595350792876092")
        .channels.resolve((logType == 0) ? "1130928987883982868" : "1130932657707024445")
        .send(logText);
    }
  }
});

client.on("guildCreate", async (guild) => {
  client.guilds.cache
    .get("1063595350792876092")
    .channels.resolve("1130929007244877845")
    .send(`Fui adicionado ao servidor ${guild.name} (${guild.id})`);

  client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
    type: "PLAYING",
  });
});

client.on("guildDelete", async (guild) => {
  if (!guild.name) return;
  client.guilds.cache
    .get("1063595350792876092")
    .channels.resolve("1130929007244877845")
    .send(`Fui removido do servidor ${guild.name} (${guild.id})`);

  client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
    type: "PLAYING",
  });
});

client.on("guildMemberRemove", async (member) => {
  client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
    type: "PLAYING",
  });
});

client.on("guildMemberAdd", async (member) => {
  const guild_vars = await Guild_vars.findAll({
    where: {
      guild_id: member.guild.id,
    },
  });

  if (!guild_vars[0]) return;

  if (guild_vars[0].join_role != null) {
    member.roles.add(guild_vars[0].join_role).catch((e) => {});
  }

  if (guild_vars[0].welcome_chat != null) {
    if (!member.guild.channels.resolve(guild_vars[0].welcome_chat)) return;
    if (
      !member.guild.me
        .permissionsIn(
          member.guild.channels.resolve(guild_vars[0].welcome_chat)
        )
        .has(Discord.Permissions.FLAGS.SEND_MESSAGES)
    )
      return;

    let welcomeChat = guild_vars[0].welcome_chat;
    const channel = member.guild.channels.resolve(welcomeChat);
    if (!channel) return;

    //First Template
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");
    ctx.font = await applyText(
      canvas,
      member.displayName,
      60,
      canvas.width / 1.5
    );

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(70, 12);
    ctx.lineTo(70, 12);
    ctx.lineTo(40, 32);
    ctx.lineTo(40, canvas.height - 50);
    ctx.lineTo(60, canvas.height - 20);
    ctx.lineTo(canvas.height + 28, canvas.height - 20);
    ctx.lineTo(canvas.height + 28, 12);
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(
      client.users.resolve(member.id).displayAvatarURL({ format: "png" })
    );
    ctx.drawImage(avatar, 40, 12, canvas.height - 28, canvas.height - 30);
    ctx.restore();

    const background = await Canvas.loadImage("./img/welcome/welcome.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.rotate(0.32);
    ctx.textBaseline = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 15;
    ctx.fillText(member.displayName, 490, 10);

    //Second Template
    /*const canvas = Canvas.createCanvas(1400, 800);
		const ctx = canvas.getContext('2d');

		const avatar = await Canvas.loadImage(client.users.resolve(member.id).displayAvatarURL({format: 'png'}));
		ctx.drawImage(avatar, 0, 0, 800, canvas.height);

		const frame = await Canvas.loadImage('./img/welcome/welcome2.png');
		ctx.drawImage(frame, 0, 0, 1400, canvas.height);

		var adventure = await new Font('./fonts/Adventure.otf', { family: 'Voice' });

		ctx.font = applyText(canvas, member.displayName, 70, canvas.width/2);
		ctx.textAlign = 'center';
		ctx.rotate(-0.07);
		ctx.textBaseline = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.shadowColor = "#000000";
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 15;
		ctx.fillText(member.displayName, 375, 320);*/

    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "welcome.png"
    );

    channel
      .send({ content: `${member}`, files: [attachment] })
      .catch((e) => {});

    client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
      type: "PLAYING",
    });
  }
});

client.on("roleDelete", async (role) => {
  try {
    const colors = await Colors.findAll({
      where: {
        role_id: role.id,
      },
    });

    if (colors[0]) {
      await Colors.destroy({
        where: {
          role_id: role.id,
        },
      });
      await Color_inventory.destroy({
        where: {
          role_id: role.id,
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("channelCreate", async (channel) => {
  if (channel.guild) {
    const guild_vars = await Guild_vars.findAll({
      where: {
        guild_id: channel.guild.id,
      },
    });

    if (guild_vars[0]) {
      if (guild_vars[0].muted_role) {
        channel.permissionOverwrites
          .create(channel.guild.roles.resolve(guild_vars[0].muted_role), {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            SPEAK: false,
          })
          .catch((e) => {});
      }
    }
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const vipRole = await Vip_role.findAll({
    where: {
      guild_id: newMember.guild.id,
    },
  });

  if (vipRole[0]) {
    if (newMember.roles.resolve(vipRole[0].role_id)) {
      await Users.update(
        { vip: true },
        {
          where: {
            user_id: newMember.id,
          },
        }
      );
    } else {
      await Users.update(
        { vip: false },
        {
          where: {
            user_id: newMember.id,
          },
        }
      );
    }
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (client.users.resolve(newState.member.id).bot) return;

  if (!newState.channel) return;

  if (newState.channelId != oldState.channelId) {
    const xp_channel = await Xp_channels.findAll({
      where: {
        guild_id: newState.guild.id,
        channel_id: newState.channelId,
      },
    });

    if (!xp_channel[0]) return;
  }

  if (newState.member.voice.channel) {
    checkVoice(newState);
  }
});

async function checkVoice(newState) {
  try {
    if (newState.member) {
      if (!newState.channel) {
        return;
      } else {
        let membersCounter = 0;
        newState.channel.members.forEach(function (actualMember) {
          if (
            !client.users.resolve(actualMember.id).bot &&
            !actualMember.voice.mute &&
            !actualMember.voice.deaf
          ) {
            membersCounter++;
          }
        });

        if (membersCounter > 1 && !newState.mute && !newState.deaf) {
          await registerUser(newState.member.user, newState.guild);
          const xp_channel = await Xp_channels.findAll({
            where: {
              guild_id: newState.guild.id,
              channel_id: newState.channelId,
            },
          });

          if (xp_channel[0]) {
            if (!cooldown.is("xp", newState.id)) {
              cooldown.add("xp", newState.id);
              let xpRate = 1;
              var today = new Date();
              if (today.getDay() == 6 || today.getDay() == 0) {
                xpRate = 2;
              }

              let randXP = Math.floor((Math.random() * 5 + 1) * xpRate);
              await Users_level.update(
                { xp: sequelize.literal(`xp + ${randXP}`) },
                {
                  where: {
                    guild_id: newState.guild.id,
                    user_id: newState.id,
                  },
                }
              );

              const userData = await Users.findAll({
                where: {
                  user_id: newState.id,
                },
              });

              let userLevel = await Users_level.findAll({
                where: {
                  user_id: newState.id,
                  guild_id: newState.guild.id,
                },
              });

              let xp = userLevel[0].xp + randXP;
              let level = parseInt(userLevel[0].level);

              const next_role = await Xp_roles.findAll({
                where: {
                  guild_id: newState.guild.id,
                  level: {
                    [Op.gt]: userLevel[0].level,
                  },
                },
                order: [["level", "ASC"]],
                limit: 1,
              });

              if (next_role[0]) {
                if (next_role[0].xp <= xp) {
                  newState.member.roles
                    .add(next_role[0].role_id)
                    .catch((e) => {});

                  await Users_level.update(
                    { level: next_role[0].level },
                    {
                      where: {
                        guild_id: newState.guild.id,
                        user_id: newState.id,
                      },
                    }
                  );

                  const rewards = await Level_rewards.findAll({
                    where: {
                      level_id: next_role[0].role_id,
                    },
                  });

                  if (rewards[0]) {
                    rewards.forEach(async function (reward) {
                      if (reward.reward_type == "fb") {
                        await Users.update(
                          {
                            ficha_comum: sequelize.literal(
                              `ficha_comum + ${reward.value}`
                            ),
                          },
                          {
                            where: {
                              user_id: newState.id,
                            },
                          }
                        );
                      } else if (reward.reward_type == "fr") {
                        await Users.update(
                          {
                            ficha_rara: sequelize.literal(
                              `ficha_rara + ${reward.value}`
                            ),
                          },
                          {
                            where: {
                              user_id: newState.id,
                            },
                          }
                        );
                      } else if (reward.reward_type == "role") {
                        newState.member.roles
                          .add(reward.value)
                          .catch((e) => {});
                      } else if (reward.reward_type == "colorfree") {
                        await Users_level.update(
                          { colorfree: 1 },
                          {
                            where: {
                              guild_id: newState.guild.id,
                              user_id: newState.id,
                            },
                          }
                        );
                      }
                    });
                  }
                }
              } else {
                //SELECT FROM Xp_roles WHERE guild_id = newState.guild.id AND xp <= xp ORDER BY xp DESC LIMIT 1
                const lastrole = await Xp_roles.findAll({
                  where: {
                    guild_id: newState.guild.id,
                    xp: {
                      [Op.lte]: xp,
                    },
                  },
                  order: [["xp", "DESC"]],
                  limit: 1,
                });
              }

              //Timeout to remove user from XP cooldown
              setTimeout(() => {
                cooldown.remove("xp", newState.id);
              }, 1000 * 60);
            }

            if (!cooldown.is("ficha", newState.id)) {
              cooldown.add("ficha", newState.id);

              await Users.update(
                { ficha_comum: sequelize.literal(`ficha_comum+1`) },
                {
                  where: {
                    user_id: newState.id,
                  },
                }
              );

              setTimeout(() => {
                cooldown.remove("ficha", newState.id);
              }, 1000 * 60 * 5);
            }
          }
        }
      }
      setTimeout(() => {
        checkVoice(newState);
      }, 1000);
    }
  } catch (e) {}
}

const pausedButtons = new Discord.MessageActionRow().addComponents(
  new Discord.MessageButton()
    .setCustomId("unpauseButton")
    .setEmoji(config.emojis.play)
    .setStyle("DANGER")
);

const unpausedButtons = new Discord.MessageActionRow().addComponents(
  new Discord.MessageButton()
    .setCustomId("rewindButton")
    .setEmoji(config.emojis.rewind)
    .setStyle("SUCCESS"),
  new Discord.MessageButton()
    .setCustomId("pauseButton")
    .setEmoji(config.emojis.pause)
    .setStyle("SUCCESS"),
  new Discord.MessageButton()
    .setCustomId("skipButton")
    .setEmoji(config.emojis.next)
    .setStyle("SUCCESS")
);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId == "back" || interaction.customId == "forward")
    return;

  let guildQueue = await client.player.getQueue(interaction.message.guild.id);
  if (!guildQueue) return interaction.message.delete().catch((e) => {});
  if (!guildQueue.nowPlaying) return;

  const localization =
    await require(`./localization/${guildQueue.data.language}.json`);

  if (interaction.message.id != guildQueue.nowPlaying.embed.id) {
    interaction.message.delete().catch((e) => {});
    return;
  }

  if (interaction.guild.me.voice.channel != interaction.member.voice.channel)
    return;

  if( interaction.customId == "rewindButton") {
    guildQueue.seek(100);

    await interaction.update({ components: [unpausedButtons] });
  }

  if (interaction.customId == "pauseButton") {
    await guildQueue.setPaused(true);

    const ProgressBar = await guildQueue.createProgressBar({
      size: config.progressBar.size,
      block: config.progressBar.block,
      arrow: config.progressBar.arrow,
    });

    let embed = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setAuthor(localization.SONG_PAUSED)
      .setThumbnail(guildQueue.nowPlaying.thumbnail)
      .setDescription(
        `[${guildQueue.nowPlaying.name}](${
          guildQueue.nowPlaying.url
        })\n${ProgressBar.bar.replaceAll(
          " ",
          config.progressBar.space
        )}\n                     ${ProgressBar.times}\n\n${
          localization.REQUESTED_BY
        } ${guildQueue.nowPlaying.requestedBy}`
      )
      .addField(
        `\u200B`,
        `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
      );
    guildQueue.nowPlaying.embed.edit({ embeds: [embed] }).catch((e) => {});

    await interaction.update({ embeds: [embed], components: [pausedButtons] });
  }

  if (interaction.customId == "unpauseButton") {
    guildQueue.setPaused(false);

    await interaction.update({ components: [unpausedButtons] });
  }

  if (interaction.customId == "skipButton") {
    guildQueue.skip();
  }
});

client.on("messageDelete", async (message) => {
  if (message.author != client.user) return;
  let guildQueue = await client.player.getQueue(message.guild.id);
  if (!guildQueue) return;
  if (!guildQueue.nowPlaying) return;

  const localization =
    await require(`./localization/${guildQueue.data.language}.json`);

  if (message.id == guildQueue.nowPlaying.embed.id) {
    const embed = new Discord.MessageEmbed()
      .setColor(guildQueue.paused ? "#FF0000" : "#00FF00")
      .setAuthor(
        guildQueue.paused ? localization.SONG_PAUSED : localization.PLAYING_NOW
      )
      .setThumbnail(guildQueue.nowPlaying.thumbnail)
      .setDescription(message.embeds[0].description)
      .addField(
        `\u200B`,
        `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
      );
    const newMessage = await message.channel.send({
      embeds: [embed],
      components: [guildQueue.paused ? pausedButtons : unpausedButtons],
    });
    guildQueue.nowPlaying.embed = newMessage;
  }
});

client.on("messageDeleteBulk", async (messages) => {
  messages.forEach(async (message) => {
    if (message.author != client.user) return;
    let guildQueue = await client.player.getQueue(message.guild.id);
    if (!guildQueue) return;
    if (!guildQueue.nowPlaying) return;

    const localization =
      await require(`./localization/${guildQueue.data.language}.json`);

    if (message.id == guildQueue.nowPlaying.embed.id) {
      const embed = new Discord.MessageEmbed()
        .setColor(guildQueue.paused ? "#FF0000" : "#00FF00")
        .setAuthor(
          guildQueue.paused
            ? localization.SONG_PAUSED
            : localization.PLAYING_NOW
        )
        .setThumbnail(guildQueue.nowPlaying.thumbnail)
        .setDescription(message.embeds[0].description)
        .addField(
          `\u200B`,
          `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
        );
      const newMessage = await message.channel.send({
        embeds: [embed],
        components: [guildQueue.paused ? pausedButtons : unpausedButtons],
      });
      guildQueue.nowPlaying.embed = newMessage;
    }
  });
});

client.player
  .on("songAdd", async (queue, song) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    if (song.isFirst) return;
    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(localization.SONG_ADDED)
      .setThumbnail(song.thumbnail)
      .setDescription(
        `[${song.name}](${song.url})\n${localization.DURATION} ${
          "`" + song.duration + "`"
        }\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
      );
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
  })

  .on("playlistAdd", async (queue, playlist) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(localization.PLAYLIST_ADDED)
      .setThumbnail(playlist.songs[0].thumbnail)
      .setDescription(
        `[${playlist.name}](${playlist.url})\n\n**${playlist.songs.length}** ${localization.SONGS}`
      );
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
  })

  .on("queueEnd", async (queue) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(
        queue.data.queueInitMessage.guild.name,
        queue.data.queueInitMessage.guild.iconURL()
      )
      .setDescription(localization.QUEUE_FINISHED);
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
  })

  .on("songChanged", async (queue, newSong, oldSong) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    if (!newSong) return;

    let response = new Discord.MessageEmbed()
      .setColor("#00FF00")
      .setAuthor(localization.PLAYING_NOW)
      .setThumbnail(newSong.thumbnail)
      .setDescription(
        `[${newSong.name}](${newSong.url})\n${localization.DURATION} ${
          "`" + newSong.duration + "`"
        }\n\n${localization.REQUESTED_BY} ${newSong.requestedBy}`
      )
      .addField(
        `\u200B`,
        `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
      );

    if (oldSong.url == newSong.url) {
      newSong.embed = oldSong.embed;
    } else {
      const responseMessage = await queue.data.queueInitMessage.channel.send({
        embeds: [response],
        components: [unpausedButtons],
      });
      newSong.embed = responseMessage;
    }

    setTimeout(function () {
      updateEmbed(queue, newSong);
    }, 3000);
  })

  .on("songFirst", async (queue, song) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    let response = new Discord.MessageEmbed()
      .setColor("#00FF00")
      .setAuthor(localization.PLAYING_NOW)
      .setThumbnail(song.thumbnail)
      .setDescription(
        `[${song.name}](${song.url})\n${localization.DURATION} ${
          "`" + song.duration + "`"
        }\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
      )
      .addField(
        `\u200B`,
        `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
      );
    const responseMessage = await queue.data.queueInitMessage.channel.send({
      embeds: [response],
      components: [unpausedButtons],
    });
    song.embed = responseMessage;

    setTimeout(function () {
      updateEmbed(queue, song);
    }, 2000);
  })

  .on("clientDisconnect", async (queue) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(
        queue.data.queueInitMessage.guild.name,
        queue.data.queueInitMessage.guild.iconURL()
      )
      .setDescription(localization.CLIENT_DISCONNECTED);
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
  })

  .on("error", async (error, queue) => {
    const localization =
      await require(`./localization/${queue.data.language}.json`);

    let response = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setAuthor(localization.ERROR_OCCURRED)
      .setDescription(error);
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
  });

var updateEmbed = async function (queue, song) {
  var update = setInterval(async function () {
    const localization =
      await require(`./localization/${queue.data.language}.json`);
    try {
      let ProgressBar = queue.createProgressBar({
        size: config.progressBar.size,
        block: config.progressBar.block,
        arrow: config.progressBar.arrow,
      });
      let response = new Discord.MessageEmbed()
        .setColor(queue.paused ? "#FF0000" : "#00FF00")
        .setAuthor(
          queue.paused ? localization.SONG_PAUSED : localization.PLAYING_NOW
        )
        .setThumbnail(song.thumbnail)
        .setDescription(
          `[${song.name}](${song.url})\n${ProgressBar.bar.replaceAll(
            " ",
            config.progressBar.space
          )}\n                     ${ProgressBar.times}\n\n${
            localization.REQUESTED_BY
          } ${song.requestedBy}`
        )
        .addField(
          `\u200B`,
          `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
        );

      song.embed
        .edit({
          embeds: [response],
          components: [queue.paused ? pausedButtons : unpausedButtons],
        })
        .catch((e) => {});

      if (queue.nowPlaying.embed.id != song.embed.id) {
        HandleError(song, update, localization);
      }
    } catch (e) {
      HandleError(song, update, localization);
    }
  }, 2000);
};

const HandleError = async function (song, update, localization) {
  let response = new Discord.MessageEmbed()
    .setColor("#FF0000")
    .setAuthor(localization.SONG_FINISHED)
    .setThumbnail(song.thumbnail)
    .setDescription(
      `[${song.name}](${song.url})\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
    )
    .addField(
      `\u200B`,
      `[Invite me](https://discord.com/api/oauth2/authorize?client_id=893320420672024637&permissions=8&scope=bot)`
    );
  song.embed.edit({ embeds: [response], components: [] }).catch((e) => {});
  clearInterval(update);
};

client.on("error", (err) => {
  console.log(`\x1b[31m%s\x1b[0m`, err.message);
  client.guilds.cache
    .get("1063595350792876092")
    .channels.resolve("1130933058363736195")
    .send(err.message);
});

const applyText = (canvas, text, size, maxW) => {
  const ctx = canvas.getContext("2d");

  let fontSize = size;

  do {
    ctx.font = `${(fontSize -= 5)}px edosz`;
  } while (ctx.measureText(text).width > maxW - 100);
  return ctx.font;
};

process.on("SIGINT", function () {
  console.log(`\x1b[32m%s\x1b[0m`, "\nAplicação desligada com CTRL+C");
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
  client.guilds.cache
    .get('1063595350792876092') // ID do servidor Discord
    .channels.resolve('1130933058363736195') // ID do canal Discord para enviar as mensagens de erro
    .send(`Ocorreu um erro não tratado na aplicação:\n\`${err.message}\``)
    .catch(console.error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada sem tratamento:', reason);
  client.guilds.cache
    .get('1063595350792876092') // ID do servidor Discord
    .channels.resolve('1130933058363736195') // ID do canal Discord para enviar as mensagens de erro
    .send(`Ocorreu uma promessa rejeitada sem tratamento na aplicação:\n\`${reason}\``)
    .catch(console.error);
});

console.log(`\x1b[32m%s\x1b[0m`, "Bot desenvolvido por: Enre Lyugi");

client.login(process.env.TOKEN);
