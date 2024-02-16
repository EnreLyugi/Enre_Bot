const Discord = require('discord.js');
const {
  Vip_role
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0]) return message.channel.send(localization.usage.addviprole.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);

  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  let role_id = role.id;

  const vip_role = await Vip_role.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  if(vip_role[0])
  {
    await Vip_role.update({ role_id: role_id }, {
      where: {
        guild_id: message.guild.id
      }
    });
    message.reply(localization.VIP_ROLE_UPDATED);
  }
  else
  {
    await Vip_role.create({
      guild_id: message.guild.id, 
      role_id: role_id
    });
    message.reply(localization.VIP_ROLE_ADDED);
  }
}
