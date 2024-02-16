const Discord = require('discord.js');
const config = require('../config.json');
const {
  Users_level
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize, defcolor, command) => {
  const userLevel = await Users_level.findAll({
    where: {
      guild_id: message.guild.id,
      user_id: message.author.id
    }
  });

  const embed = new Discord.MessageEmbed()
    .setColor(defcolor)
    .setAuthor(message.guild.name, message.guild.iconURL())
    .setDescription(localization.YOU_HAVE + ':\n' + userLevel[0].xp + 'XP');

  message.reply({embeds: [embed]});
};
