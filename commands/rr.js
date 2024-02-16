const Discord = require('discord.js')
const {
  Xp_roles,
  Level_rewards
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize, defcolor, command) => {
  if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0]) return message.reply(localization.usage.rr.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);

  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  const roles = await Xp_roles.findAll({
    where: {
      role_id: role.id
    }
  });

  if(!roles[0]) return message.reply(localization.THIS_ROLE_IS_NOT_LEVEL_ROLE);
  await Level_rewards.destroy({
    where: {
        level_id: role.id
    }
  });
  message.reply(localization.REWARDS_RESETED.replace(`{{level}}`, roles[0].level));
}
