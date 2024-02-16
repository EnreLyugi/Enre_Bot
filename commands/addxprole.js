const Discord = require('discord.js');
const { Op } = require('sequelize')
const {
  Xp_roles,
  Users_level
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
  if(!message.guild.me.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.reply(localization.REQUIRE_CLIENT_MANAGE_ROLES_PERMISSION);

  if(!args[0] || !args[1] || !args[2] || !message.mentions.roles.size) return message.channel.send(localization.usage.addxprole.replace(`{{prefix}}`, prefix));

  if(isNaN(args[1]) || isNaN(args[2])) return message.channel.send(localization.usage.addxprole.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);

  let level = parseInt(args[1]);
  let xp = parseInt(args[2]);

  const xpRole = await Xp_roles.findAll({
    where: {
      [Op.or]: [
        {
          level: {
            [Op.lt]: level
          },
          xp: {
            [Op.gt]: xp
          },
          guild_id: message.guild.id       
        },
        {
          level: {
            [Op.gt]: level
          },
          xp: {
            [Op.lt]: xp
          },
          guild_id: message.guild.id  
        },
        {
          level: level,
          guild_id: message.guild.id  
        },
        {
          xp: xp,
          guild_id: message.guild.id
        },
        {
          role_id: role.id,
          guild_id: message.guild.id
        }
      ]
    }
  });

  if(xpRole[0])
  {
    if(xpRole[0].level == level) return message.channel.send(localization.ROLE_ALREADY_EXISTS_TO_LEVEL);
    if(xpRole[0].xp == xp) return message.channel.send(localization.ROLE_ALREADY_EXISTS_TO_XP);
    if(xpRole[0].level < level && xpRole[0].xp > xp) return message.channel.send(localization.EXISTS_A_ROLE_OF_LOWER_LEVEL_WITH_HIGHER_XP);
    if(xpRole[0].level > level && xpRole[0].xp < xp) return message.channel.send(localization.EXISTS_A_ROLE_OF_HIGHER_LEVEL_WITH_LOWER_XP);
    if(xpRole[0].role_id == role.id) return message.channel.send(localization.LEVEL_ALREADY_EXISTS_TO_ROLE);
  }
  else
  {
    await Xp_roles.create({
      guild_id: message.guild.id,
      role_id: role.id,
      level: level,
      xp: xp
    });
    message.channel.send(localization.ROLE_ADDED_TO_LEVEL.replace(`{{role}}`, role).replace(`{{level}}`, level).replace(`{{xp}}`, xp));

    const users = await Users_level.findAll({
      where: {
        guild_id: message.guild.id,
        xp: {
          [Op.gt]: xp
        }
      }
    });

    if(users[0])
    {
      users.forEach(async function(row) {
        if(!message.guild.members.resolve(row.user_id)) return;
        message.guild.members.resolve(row.user_id).roles.add(role.id).catch(e => {});
        if(row.level < level)
        {
          await Users_level.update({ level: level }, {
            where: {
              guild_id: message.guild.id,
              user_id: row.user_id
            }
          });
        }
      });
    }
  }
}
