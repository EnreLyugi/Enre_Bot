const Discord = require('discord.js');
const {
    Guild_vars
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0]) return message.reply(localization.usage.setjoinrole.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);
  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  await Guild_vars.update({ join_role: role.id }, {
    where: {
        guild_id: message.guild.id
    }
  });

  message.reply(localization.NEW_MEMBERS_ROLE_UPDATED);
};