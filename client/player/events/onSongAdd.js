const { EmbedBuilder } = require('discord.js');
const { default_color } = require("../../../config.json");

const onSongAdd = async (queue, song) => {
    const localization = await require(`../../../localization/${queue.data.language}.json`);
  
    if (song.isFirst) return;
    let response = new EmbedBuilder()
      .setColor(default_color)
      .setAuthor({ name: localization.SONG_ADDED })
      .setThumbnail(song.thumbnail)
      .setDescription(
        `[${song.name}](${song.url})\n${localization.DURATION} ${
          "`" + song.duration + "`"
        }\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
      );
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
};

module.exports = onSongAdd;