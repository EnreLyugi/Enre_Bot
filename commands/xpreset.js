const { PermissionsBitField } = require('discord.js');
const {
  Users_level,
  Xp_roles
} = require('../includes/tables.js');

exports.run = async ({ localization, message }) => {
  if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  const users = await Users_level.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  const roles = await Xp_roles.findAll({
    where: {
      guild_id: message.guild.id
    },
    order: [['xp', 'ASC']]
  });

  if(roles[0])
  {
    let newLevel = 0;
    if(roles[0].xp == 0)
    {
      newLevel = roles[0].level
    }

    users.forEach(async (user) => {
      await Users_level.update({ xp: 0, level: newLevel }, {
        where: {
          user_id: user.user_id,
          guild_id: message.guild.id
        }
      });

      roles.forEach(async (userRole) => {
        if(userRole.xp > 0)
        {
          message.guild.members.resolve(user.user_id).roles.remove(userRole.role_id).catch(e => {});
        }
      });
    });
  }
  else
  {
    users.forEach(async (user) => {
      await Users_level.update({ xp: 0, level: 0 }, {
        where: {
          user_id: user.user_id,
          guild_id: message.guild.id
        }
      });
    });
  }
  message.reply(localization.XP_RESETED);
}
