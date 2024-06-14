const { EmbedBuilder } = require('discord.js');
const {
  Users_level
} = require('../includes/tables.js');

exports.run = async ({ localization, message, defcolor }) => {
  const userLevel = await Users_level.findAll({
    where: {
      guild_id: message.guild.id,
      user_id: message.author.id
    }
  });

  const embed = new EmbedBuilder()
    .setColor(defcolor)
    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
    .setDescription(localization.YOU_HAVE + ':\n' + userLevel[0].xp + 'XP');

  message.reply({embeds: [embed]});
};
