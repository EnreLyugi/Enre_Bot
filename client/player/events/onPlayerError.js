const { EmbedBuilder } = require('discord.js');

const onPlayerError = async (error, queue) => {
    const localization = await require(`../../../localization/${queue.data.language}.json`);
  
    let response = new EmbedBuilder()
      .setColor("#FF0000")
      .setAuthor({ name: localization.ERROR_OCCURRED })
      .setDescription(error);
    queue.data.queueInitMessage.channel.send({ embeds: [response] });
};

module.exports = onPlayerError;