const { PermissionsBitField } = require('discord.js');
const {
    Guild_vars
} = require('../includes/tables.js');

exports.run = async ({ localization, message }) => {
  if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  await Guild_vars.update({ join_role: 'NULL' }, {
    where: {
        guild_id: message.guild.id
    }
  });

  message.reply(localization.NEW_MEMBERS_ROLE_UPDATED);
};