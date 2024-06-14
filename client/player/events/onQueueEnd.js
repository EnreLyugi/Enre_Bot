const { EmbedBuilder } = require('discord.js');
const { default_color } = require("../../../config.json");

const onQueueEnd = async (queue) => {
    const localization = await require(`../../../localization/${queue.data.language}.json`);
  
    let response = new EmbedBuilder()
      .setColor(default_color)
      .setAuthor({
        name: queue.data.queueInitMessage.guild.name,
        iconURL: queue.data.queueInitMessage.guild.iconURL()
      })
      .setDescription(localization.QUEUE_FINISHED);
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
};

module.exports = onQueueEnd;