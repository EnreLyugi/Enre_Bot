const Discord = require('discord.js');
const {
  Colors
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
  
  if(!args[0]) return message.channel.send(localization.usage.removecolor.replace(`{{prefix}}`, prefix));

  let role = message.guild.roles.resolve(message.mentions.roles.first().id) || message.guild.roles.resolve(args[0]);

  if(!role) return message.channel.send(localization.ROLE_DONT_EXISTS);

  const color = await Colors.findAll({
    where: {
      role_id: role.id
    }
  });

  if(color[0])
  {
    await Colors.destroy({
      where: {
        role_id: role.id
      }
    });
    message.channel.send(localization.COLOR_REMOVED.replace(`{{color}}`, color[0].color));
  }
  else
  {
    return message.reply(localization.COLOR_NOT_REGISTERED);
  }
}
