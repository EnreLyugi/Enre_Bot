const { PermissionsBitField } = require('discord.js');
const {
  Guild_vars
} = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
  
  if(!args[0]) return message.reply(localization.usage.setmutedrole.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);
  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  await Guild_vars.update({ muted_role: role.id }, {
    where: {
        guild_id: message.guild.id
    }
  });

  message.guild.channels.cache.forEach(async (channel) => {
    channel.permissionOverwrites.create(role, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false }).catch(e => {});
  });

  message.reply(localization.MUTED_ROLE_UPDATED);
};
