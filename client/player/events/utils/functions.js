const { EmbedBuilder } = require('discord.js');
const { progressBar } = require('../../../../config.json');
const { buttons } = require('../../../components/')

var updateEmbed = async function (queue, song) {
    var update = setInterval(async function () {
      if(!queue.isPlaying) return;
      const localization = await require(`../../../../localization/${queue.data.language}.json`);
      try {
        let ProgressBar = queue.createProgressBar({
          size: progressBar.size,
          block: progressBar.block,
          arrow: progressBar.arrow,
        });
        let response = new EmbedBuilder()
          .setColor(queue.paused ? "#FF0000" : "#00FF00")
          .setAuthor({
            name: queue.paused ? localization.SONG_PAUSED : localization.PLAYING_NOW
          })
          .setThumbnail(song.thumbnail)
          .setDescription(
            `[${song.name}](${song.url})\n${ProgressBar.bar.replaceAll(
              " ",
              progressBar.space
            )}\n                     ${ProgressBar.times}\n\n${
              localization.REQUESTED_BY
            } ${song.requestedBy}`
          )
          .addFields([
            {
              name: `\u200B`,
              value: `[Invite me](https://discord.com/api/oauth2/authorize?client_id=1249736797056143400&permissions=1099821344854&scope=bot)`
            }
          ]);
  
        song.embed
          .edit({
            embeds: [response],
            components: [queue.paused ? buttons.pausedButtons : buttons.unpausedButtons],
          })
          .catch((e) => {
            console.log('erro ao editar o embed', song.embed.id)
          });

        if (queue.nowPlaying.embed.id != song.embed.id || !queue.isPlaying) {
          HandleError(song, update, localization);
        }
      } catch (e) {
        HandleError(song, update, localization);
      }
    }, 2000);
};

const HandleError = async function (song, update, localization) {
    let response = new EmbedBuilder()
      .setColor("#FF0000")
      .setAuthor({ name: localization.SONG_FINISHED })
      .setThumbnail(song.thumbnail)
      .setDescription(
        `[${song.name}](${song.url})\n\n${localization.REQUESTED_BY} ${song.requestedBy}`
      )
      .addFields([
        {
          name: `\u200B`,
          value: `[Invite me](https://discord.com/api/oauth2/authorize?client_id=1249736797056143400&permissions=1099821344854&scope=bot)`
        }
      ]);
    song.embed.edit({ embeds: [response], components: [] }).catch((e) => {});
    clearInterval(update);
};

module.exports = { updateEmbed }