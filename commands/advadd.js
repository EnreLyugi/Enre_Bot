const { PermissionsBitField } = require('discord.js');
const { Op } = require('sequelize');
const {
  Advertences_roles
} = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0] || !args[1]) return message.channel.send(localization.usage.advadd.replace(`{{prefix}}`, prefix));

  if(args[0] != 1 && args[0] != 2 && args[0] != 3) return message.channel.send(localization.usage.advadd.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[1]);

  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  const advertence_role = await Advertences_roles.findAll({
    where: {
      [Op.or]: [
        {
          guild_id: message.guild.id,
          adv_id: args[0]
        },
        {
          role_id: role.id
        }
      ]
    }
  });

  if(!advertence_role[0])
  {
    await Advertences_roles.create({
      guild_id: message.guild.id,
      adv_id: args[0],
      role_id: role.id
    });
    message.channel.send(localization.ADVERTENCE_CREATED.replace(`{{level}}`, args[0]));
  }
  else
  {
    if(advertence_role[0].adv_id == args[0])
    {
      message.channel.send(localization.ADVERTENCE_LEVEL_ALREADY_EXISTS.replace(`{{level}}`, args[0]));
    }
    else if(advertence_role[0].role_id == role.id)
    {
      message.channel.send(localization.ADVERTENCE_ROLE_ALREADY_EXISTS);
    }
  }
}
