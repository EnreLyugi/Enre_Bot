const { EmbedBuilder } = require('discord.js');
const { default_color } = require("../../../config.json");

const onPlaylistAdd = async (queue, playlist) => {
    const localization = await require(`../../../localization/${queue.data.language}.json`);
  
    let response = new EmbedBuilder()
      .setColor(default_color)
      .setAuthor({ name: localization.PLAYLIST_ADDED})
      .setThumbnail(playlist.songs[0].thumbnail)
      .setDescription(
        `[${playlist.name}](${playlist.url})\n\n**${playlist.songs.length}** ${localization.SONGS}`
      );
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
};

module.exports = onPlaylistAdd;