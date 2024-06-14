const { PermissionsBitField } = require('discord.js');
const {
  Advertences_roles,
  Advertences
} = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply(localization.REQUIRE_USER_MANAGE_ROLES_PERMISSION);

  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply(localization.REQUIRE_CLIENT_MANAGE_ROLES_PERMISSION);

  if(!args[0] || !args[1]) return message.channel.send(localization.usage.removeadv.replace(`{{prefix}}`, prefix));

  if(args[0] != 1 && args[0] != 2 && args[0] != 3) return message.channel.send(localization.usage.removeadv.replace(`{{prefix}}`, prefix));

  let member = message.guild.members.resolve(message.mentions.users.first().id) || message.guild.members.resolve(args[1]);

  if(!member) return message.channel.send(localization.USER_DONT_EXISTS);

  const advertence_role = await Advertences_roles.findAll({
    where: {
      guild_id: message.guild.id,
      adv_id: args[0]
    }
  });

  if(advertence_role[0])
  {
    const advertence = await Advertences.findAll({
      where: {
        guild_id: message.guild.id,
        user_id: member.id,
        adv_level: advertence_role[0].adv_id
      }
    });

    if(advertence[0])
    {
      await member.roles.remove(advertence_role[0].role_id).catch(e => {return message.reply(localization.ERROR_REMOVING_ROLE_FROM_USER)});
      message.reply(localization.ADVERTENCE_REMOVED_FROM_USER.replace(`{{level}}`, args[0]).replace(`{{user}}`, member));
    }
    else
    {
      message.reply(localization.USER_DONT_HAS_ADVERTENCES);
    }
  }
  else
  {
    message.channel.send(localization.ADVERTENCE_LEVEL_DONT_EXISTS.replace(`{{prefix}}`, prefix));
  }
}
