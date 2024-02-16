const Discord = require('discord.js');
const {
  Embeds
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  const embeds = Embeds.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  if(embeds[0])
  {
    let embedString = '';
    embeds.forEach(function(embed) {
      embedString = embedString + '\nID:' + embed.id + ' - ' + embed.name;
    });

    const embedList = new Discord.MessageEmbed()
      .setColor('#540094')
      .setAuthor(localization.GUILD_EMBEDS, message.guild.iconURL())
      .setDescription(embedString);
    message.channel.send({embeds: [embedList]});
  }
  else
  {
      message.reply(localization.NO_EMBEDS_ON_GUILD);
  }
}
