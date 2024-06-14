const { EmbedBuilder } = require('discord.js');
const { buttons } = require('../../components/');
const { updateEmbed } = require('./utils/functions');

const onSongFirst = async (queue, song) => {
    const localization = await require(`../../../localization/${queue.data.language}.json`);
  
    let response = new EmbedBuilder()
      .setColor("#00FF00")
      .setAuthor({ name: localization.PLAYING_NOW })
      .setThumbnail(song.thumbnail)
      .setDescription(
        `[${song.name}](${song.url})\n${localization.DURATION} ${
          "`" + song.duration + "`"
        }\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
      )
      .addFields([
        {
          name: `\u200B`,
          value: `[Invite me](https://discord.com/api/oauth2/authorize?client_id=1249736797056143400&permissions=1099821344854&scope=bot)`
        }
      ]);
    const responseMessage = await queue.data.queueInitMessage.channel.send({
      embeds: [response],
      components: [buttons.unpausedButtons],
    });
    song.embed = responseMessage;
  
    setTimeout(function () {
      updateEmbed(queue, song);
    }, 2000);
};

module.exports = onSongFirst;