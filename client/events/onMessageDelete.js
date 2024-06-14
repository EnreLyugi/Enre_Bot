const { EmbedBuilder } = require('discord.js');
const buttons = require('../components/buttons');

const onMessageDelete = async (client, message) => {
    if (message.author != client.user) return;
    let guildQueue = await client.player.getQueue(message.guild.id);
    if (!guildQueue) return;
    if (!guildQueue.nowPlaying) return;
  
    const localization =
      await require(`../../localization/${guildQueue.data.language}.json`);
  
    if (message.id == guildQueue.nowPlaying.embed.id) {
      const embed = new EmbedBuilder()
        .setColor(guildQueue.paused ? "#FF0000" : "#00FF00")
        .setAuthor({ name: guildQueue.paused ? localization.SONG_PAUSED : localization.PLAYING_NOW })
        .setThumbnail(guildQueue.nowPlaying.thumbnail)
        .setDescription(message.embeds[0].description)
        .addFields([
          {
            name: `\u200B`,
            value: `[Invite me](https://discord.com/api/oauth2/authorize?client_id=1249736797056143400&permissions=8&scope=bot)`
          }
        ]);
      const newMessage = await message.channel.send({
        embeds: [embed],
        components: [guildQueue.paused ? buttons.pausedButtons : buttons.unpausedButtons],
      });
      guildQueue.nowPlaying.embed = newMessage;
    }
};

module.exports = onMessageDelete