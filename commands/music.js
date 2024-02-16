const { Guild, GuildMember } = require("discord.js");
const Discord = require("discord.js");
const config = require("../config.json");
const { RepeatMode } = require("discord-music-player");
const { paginate } = require("../includes/functions.js");
const { Guild_vars } = require("../includes/tables.js");

const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

exports.run = async (
  client,
  prefix,
  localization,
  message,
  args,
  sequelize,
  defcolor,
  command
) => {
  let guildQueue = client.player.getQueue(message.guild.id);

  let url = args.join(" ");

  let secondCommand = undefined;

  let member = message.guild?.members.resolve(message.author.id);
  let guild = message.guild;

  if (!member) return;
  if (!guild) return;

  if (url.includes(`${prefix}shuffle`)) {
    secondCommand = true;
    url = url.replace(`${prefix}shuffle`, "").trimEnd().trimStart();
  }

  const guildVars = await Guild_vars.findAll({
    where: {
      guild_id: message.guild.id,
    },
  });

  let autoShuffle = secondCommand || guildVars[0].auto_shuffle;

  if (!message.member.voice.channel) {
    let response = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setDescription(localization.MUST_BE_ON_CHANNEL);
    message.channel.send({ embeds: [response] });
    return;
  }

  if (!guild.me) return console.log(guild.me);

  if (
    guild.me.voice.channel &&
    guild.me.voice.channel != member.voice.channel
  ) {
    let response = new Discord.MessageEmbed()
      .setColor("#FF0000")
      .setAuthor(guild.name, guild.iconURL())
      .setDescription(localization.MUST_BE_ON_SAME_CHANNEL);
    message.channel.send({ embeds: [response] });
    return;
  }

  if (
    !guild.me
      .permissionsIn(member.voice.channel)
      .has(
        Discord.Permissions.FLAGS.CONNECT &&
          Discord.Permissions.FLAGS.VIEW_CHANNEL &&
          Discord.Permissions.FLAGS.SPEAK
      )
  )
    return message.reply(localization.REQUIRE_SEE_CONNECT_AND_SPEAK_PERMISSION);

  if (command === "play" || command === "p") {
    if (!args[0])
      return message.reply(
        localization.usage.play.replace(`{{prefix}}`, prefix)
      );

    let queue = await client.player.createQueue(guild.id, {
      data: {
        queueInitMessage: message,
        language: localization.language,
      },
    });

    await queue.join(member.voice.channel);

    if (
      (url.includes("playlist") &&
        (url.includes("youtube.com") ||
          url.includes("youtu.be") ||
          url.includes("spotify.com"))) ||
      ((!url.includes("i=") || url.includes("playlist")) &&
        url.includes("apple.com"))
    ) {
      let song = await queue
        .playlist(url, {
          requestedBy: message.author,
          shuffle: autoShuffle,
        })
        .catch((err) => {
          let response = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setAuthor(localization.ERROR_OCCURRED)
            .setDescription(err.message);
          message.channel.send({ embeds: [response] });
          if (!guildQueue) queue.stop();
        });
    } else {
      let song = await queue
        .play(url, {
          requestedBy: message.author,
        })
        .catch((err) => {
          let response = new Discord.MessageEmbed()
            .setColor(`#FF0000`)
            .setAuthor(localization.ERROR_OCCURRED)
            .setDescription(err.message);
          message.channel.send({ embeds: [response] });
          if (!guildQueue) queue.stop();
        });
    }
    return;
  }

  if (command === "playlist-") {
    let queue = await client.player.createQueue(message.guild.id, {
      data: {
        queueInitMessage: message,
        guildInitMessage: message.guild,
      },
    });

    await queue.join(message.member.voice.channel);

    let song = await queue
      .playlist(args.join(" "), {
        requestedBy: message.author,
        shuffle: autoShuffle,
      })
      .catch((_) => {
        if (!guildQueue) queue.stop();
      });
  }

  if (command === "skip") {
    if (!guildQueue) return;
    if (!guildQueue.connection) return;

    guildQueue.skip((args[0] ?? 0) > 1 ? (args[0]-2) : 0);
  }

  if (command === "stop" || command === "parar") {
    if (!guildQueue) return;
    if (!guildQueue.connection) return;
    guildQueue.stop();
  }

  if (command === "loop") {
    if (!guildQueue) return;
    let description = '';
    if (guildQueue.repeatMode == 0) {
      guildQueue.setRepeatMode(RepeatMode.QUEUE);
      description = localization.LOOP_ENABLED;
    } else {
      guildQueue.setRepeatMode(RepeatMode.DISABLED);
      description = localization.LOOP_DISABLED;
    }

    let response = new Discord.MessageEmbed()
        .setColor(defcolor)
        .setAuthor(`LOOP`)
        .setDescription(description);
    message.channel.send({ embeds: [response] });
  }

  if (command === "volume") {
    if (!args[0])
      return message.reply(
        localization.usage.volume.replace(`{{prefix}}`, prefix)
      );
    if (!guildQueue) return;
    if (parseInt(args[0]) > 100) return message.reply(localization.MAX_VOLUME);

    guildQueue.setVolume(parseInt(args[0]));
    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setDescription(
        localization.VOLUME_CHANGED.replaceAll(`{{volume}}`, parseInt(args[0]))
      );
    message.channel.send({ embeds: [response] });
  }

  if (command === "seek") {
    args[0] != "0"
      ? guildQueue.seek(parseInt(args[0]) * 1000)
      : guildQueue.seek(100);
  }

  if (command === "clearqueue-") {
    guildQueue.clearQueue();
  }

  if (command === "shuffle" || command === "misturar") {
    if (!guildQueue) return;
    guildQueue.shuffle();
    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setDescription(localization.SONGS_SHUFFLED);
    message.channel.send({ embeds: [response] });
  }

  if (command === "queue" || command == "fila") {
    if (!guildQueue) return;

    const rows = 10;

    let totalPages = Math.ceil(guildQueue.songs.length / rows);
    let pages = [];

    let songIndex = 1;
    for (i = 1; i <= totalPages; i++) {
      let currentPage = paginate(guildQueue.songs, rows, i);
      let page = [];

      for (const song of currentPage) {
        page.push({
          index: songIndex,
          song: song,
        });
        songIndex++;
      }

      pages.push(page);
    }

    const backId = "back";
    const forwardId = "forward";

    const backButton = new Discord.MessageButton()
      .setCustomId(backId)
      .setEmoji("⬅️")
      .setStyle("SECONDARY");

    const forwardButton = new Discord.MessageButton()
      .setCustomId(forwardId)
      .setEmoji("➡️")
      .setStyle("SECONDARY");

    let description = "";
    for (const page of pages[0]) {
      description += `${page.index} -> [${page.song.name}](${page.song.url})[${page.song.duration}]\n`;
    }

    const queueEmbed = new Discord.MessageEmbed({
      color: defcolor,
      author: {
        name: message.guild.name,
        icon_url: message.guild.iconURL(),
      },
      description: description,
      footer: {
        text: `${localization.PAGE}: 1/${pages.length}`,
        icon_url: client.user.avatarURL(),
      },
    });

    const canFitOnOnePage = pages.length < 2;
    const queueMessage = await message.channel.send({
      embeds: [queueEmbed],
      components: [
        new Discord.MessageActionRow({ components: [forwardButton] }),
      ],
    });

    if (canFitOnOnePage) return;

    const filter = (i) =>
      (i.customId === backId || i.customId === forwardId) &&
      i.user.id === message.author.id &&
      i.message.id == queueMessage.id;

    const collector = queueMessage.channel.createMessageComponentCollector({
      filter,
    });

    let currentIndex = 0;
    collector.on("collect", async (interaction) => {
      if (interaction.user.id != message.author.id) return;

      interaction.customId === backId
        ? (currentIndex -= 1)
        : (currentIndex += 1);

      let description = "";
      for (const page of pages[currentIndex]) {
        description += `${page.index} - [${page.song.name}](${page.song.url})[${page.song.duration}]\n`;
      }

      const pageEmbed = new Discord.MessageEmbed({
        color: defcolor,
        author: {
          name: interaction.guild.name,
          icon_url: interaction.guild.iconURL(),
        },
        description: `${description}`,
        footer: {
          text: `${localization.PAGE}: ${currentIndex + 1}/${pages.length}`,
          icon_url: client.user.avatarURL(),
        },
      });

      await interaction
        .update({
          embeds: [pageEmbed],
          components:
            currentIndex > 0 && currentIndex < pages.length - 1
              ? [
                  new Discord.MessageActionRow({
                    components: [backButton, forwardButton],
                  }),
                ]
              : currentIndex == 0
              ? [new Discord.MessageActionRow({ components: [forwardButton] })]
              : [new Discord.MessageActionRow({ components: [backButton] })],
        })
        .catch((e) => {});
    });
  }

  if (command === "getvolume-") {
    console.log(guildQueue.volume);
  }

  if (command === "nowplaying-" || command === "tocando-") {
    if (!guildQueue) return;
    const ProgressBar = guildQueue.createProgressBar({
      block: config.progressBar.block,
      arrow: config.progressBar.arrow,
    });

    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(localization.PLAYING_NOW)
      .setThumbnail(guildQueue.nowPlaying.thumbnail)
      .setDescription(
        `[${guildQueue.nowPlaying.name}](${
          guildQueue.nowPlaying.url
        })\n${ProgressBar.bar.replaceAll(
          " ",
          config.progressBar.space
        )}\n                              ${ProgressBar.times}\n\n${
          localization.REQUESTED_BY
        } ${guildQueue.nowPlaying.requestedBy}`
      );
    message.channel.send({ embeds: [response] });
  }

  if (command === "pause" || command === "pausar") {
    if (!guildQueue) return;
    guildQueue.setPaused(true);
    /*let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setDescription(`Música pausada! utilize **${prefix}continuar** para continuar.`);
    message.channel.send({embeds: [response]});*/

    const ProgressBar = guildQueue.createProgressBar({
      block: config.progressBar.block,
      arrow: config.progressBar.arrow,
    });
    const progressbar = ProgressBar.prettier.replaceAll(" ", "▒");

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
        )}\n                              ${ProgressBar.times}\n\n${
          localization.REQUESTED_BY
        } ${guildQueue.nowPlaying.requestedBy}`
      );
    guildQueue.nowPlaying.embed.edit({ embeds: [embed] }).catch((e) => {});
  }

  if (command === "resume" || command === "continuar") {
    guildQueue.setPaused(false);
  }

  if (command === "remove-") {
    guildQueue.remove(parseInt(args[0]) - 1);
  }

  if (command === "createprogressbar-") {
    const ProgressBar = guildQueue.createProgressBar({ size: 100 });
    const progressbar = ProgressBar.prettier.replaceAll(" ", " ");

    // [======>              ][00:35/2:20]
    console.log(progressbar);
    let response = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor(message.guild.name, message.guild.iconURL())
      .setDescription(progressbar);
    message.channel.send({ embeds: [response] });
    message.channel.send(progressbar);
  }

  if (command === "autoshuffle") {
    if (
      !message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)
    )
      return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

    if (guildVars[0].auto_shuffle) {
      let response = new Discord.MessageEmbed()
        .setColor(defcolor)
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setDescription(localization.AUTO_SHUFFLE_DISABLED);
      message.channel.send({ embeds: [response] });

      await Guild_vars.update(
        { auto_shuffle: false },
        {
          where: {
            guild_id: message.guild.id,
          },
        }
      );
    } else {
      let response = new Discord.MessageEmbed()
        .setColor(defcolor)
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setDescription(localization.AUTO_SHUFFLE_ENABLED);
      message.channel.send({ embeds: [response] });

      await Guild_vars.update(
        { auto_shuffle: true },
        {
          where: {
            guild_id: message.guild.id,
          },
        }
      );
    }
  }
};
