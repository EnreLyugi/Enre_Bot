const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../config.json");
const { emojis } = require("../config.json");
const { RepeatMode } = require("@jadestudios/discord-music-player");
const { paginate } = require("../includes/functions.js");
const { Guild_vars } = require("../includes/tables.js");

exports.run = async ({
  client,
  prefix,
  localization,
  message,
  args,
  defcolor,
  command
}) => {
  console.log('initialized');
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
    let embed = new EmbedBuilder();
    let response = embed
        .setColor("#FF0000")
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
        .setDescription(localization.MUST_BE_ON_CHANNEL);
    message.channel.send({ embeds: [response] });
    return;
  }

  if (!guild.members.me) return console.log(guild.members.me);

  if (
    guild.members.me.voice.channel &&
    guild.members.me.voice.channel != member.voice.channel
  ) {
    let embed = new EmbedBuilder();
    let response = embed
      .setColor("#FF0000")
      .setAuthor({ name: guild.name, iconURL: guild.iconURL()})
      .setDescription(localization.MUST_BE_ON_SAME_CHANNEL);
    message.channel.send({ embeds: [response] });
    return;
  }

  if (
    !guild.members.me
      .permissionsIn(member.voice.channel)
      .has(
        PermissionsBitField.Flags.Connect &&
        PermissionsBitField.Flags.ViewChannel &&
        PermissionsBitField.Flags.Speak
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
      await queue
        .playlist(url, {
          maxSongs: 10000,
          requestedBy: message.author,
          shuffle: autoShuffle,
        })
        .catch((err) => {
          let embed = new EmbedBuilder();
          let response = embed
            .setColor("#FF0000")
            .setAuthor({ name: localization.ERROR_OCCURRED })
            .setDescription(err.message);
          message.channel.send({ embeds: [response] });
          if (!guildQueue) queue.stop();
        });
    } else {
      await queue.play(url, {
          requestedBy: message.author,
        })
        .catch((err) => {
          let response = new EmbedBuilder()
            .setColor(`#FF0000`)
            .setAuthor({ name: localization.ERROR_OCCURRED })
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

    let response = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: `LOOP` })
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
    let response = new EmbedBuilder()
      .setColor(defcolor)
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
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
    let response = new EmbedBuilder()
      .setColor(defcolor)
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
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

    const backButton = new ButtonBuilder()
      .setCustomId(backId)
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Secondary);

    const forwardButton = new ButtonBuilder()
      .setCustomId(forwardId)
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Secondary);

    let description = "";
    for (const page of pages[0]) {
      description += `${page.index} -> [${page.song.name}](${page.song.url})[${page.song.duration}]\n`;
    }

    const queueEmbed = new EmbedBuilder({
      author: {
        name: message.guild.name,
        icon_url: message.guild.iconURL(),
      },
      description: description,
      footer: {
        text: `${localization.PAGE}: 1/${pages.length}`,
        icon_url: client.user.avatarURL(),
      },
    }).setColor(defcolor);

    const canFitOnOnePage = pages.length < 2;
    const pageComponents = canFitOnOnePage ? [] : [ new ActionRowBuilder().addComponents(forwardButton) ]
    const queueMessage = await message.channel.send({
      embeds: [queueEmbed],
      components: pageComponents,
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

      const pageEmbed = new EmbedBuilder({
        author: {
          name: interaction.guild.name,
          icon_url: interaction.guild.iconURL(),
        },
        description: `${description}`,
        footer: {
          text: `${localization.PAGE}: ${currentIndex + 1}/${pages.length}`,
          icon_url: client.user.avatarURL(),
        },
      }).setColor(defcolor);

      await interaction
        .update({
          embeds: [pageEmbed],
          components:
            currentIndex > 0 && currentIndex < pages.length - 1
              ? [
                  new ActionRowBuilder().addComponents([backButton, forwardButton]),
                ]
              : currentIndex == 0
              ? [new ActionRowBuilder().addComponents(forwardButton)]
              : [new ActionRowBuilder().addComponents(backButton)],
        })
        .catch((e) => {
          console.log(e);
        });
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

    let embed = new EmbedBuilder();
    let response = embed
      .setColor(defcolor)
      .setAuthor({ name: localization.PLAYING_NOW })
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

    let embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setAuthor({ name: localization.SONG_PAUSED })
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
    let response = new EmbedBuilder()
      .setColor(defcolor)
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
      .setDescription(progressbar);
    message.channel.send({ embeds: [response] });
    message.channel.send(progressbar);
  }

  if (command === "autoshuffle") {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    )
      return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

    if (guildVars[0].auto_shuffle) {
      let response = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
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
      let response = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
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
