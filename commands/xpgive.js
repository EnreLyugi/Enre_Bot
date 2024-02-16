const Discord = require('discord.js');
const { Op } = require('sequelize');
const {
  Users_level,
  Level_rewards,
  Xp_roles,
  Users
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0] || !args[1]) return message.channel.send(localization.usage.xpgive.replace(`{{prefix}}`, prefix));

  if(isNaN(args[0])) return message.channel.send(localization.usage.xpgive.replace(`{{prefix}}`, prefix));

  let user = message.mentions.users.first() || client.users.resolve(args[1]);

  if(!user) return message.channel.send(localization.USER_DONT_EXISTS);

  let member = message.guild.members.resolve(user.id);

  if(!member) return message.channel.send(localization.USER_DONT_EXISTS);

  const userLevel = await Users_level.findAll({
    where: {
      user_id: user.id,
      guild_id: message.guild.id
    }
  });

  if(userLevel[0])
  {
    await Users_level.update({ xp: sequelize.literal(`xp + ${args[0]}`) }, {
      where: {
        user_id: user.id,
        guild_id: message.guild.id
      }
    });

    let curXP = parseInt(args[0]) + parseInt(userLevel[0].xp);

    const roles = await Xp_roles.findAll({
      where: {
        xp: {
          [Op.lte]: curXP
        },
        guild_id: message.guild.id
      },
      order: [['xp', 'ASC']]
    });

    message.reply(localization.XP_ADDED.replace(`{{xp}}`, args[0]).replace(`{{member}}`, member));

    if(roles[0])
    {
      roles.forEach(async function(role) {
        member.roles.add(role.role_id).catch(e => {});

        await Users_level.update({ level: role.level }, {
          where: {
            user_id: user.id,
            guild_id: message.guild.id
          }
        });

        const rewards = await Level_rewards.findAll({
          where: {
            level_id: role.role_id
          }
        });

        if(rewards[0])
        {
          rewards.forEach(async function(reward) {
            if(reward.reward_type == 'fb')
            {
              await Users.update({ ficha_comum: sequelize.literal(`ficha_comum + ${reward.value}`) }, {
                where: {
                  user_id: user.id
                }
              });
            }
            else if(reward.reward_type == 'fr')
            {
              await Users.update({ ficha_rara: sequelize.literal(`ficha_rara + ${reward.value}`) }, {
                where: {
                  user_id: user.id
                }
              });
            }
            else if(reward.reward_type == 'role')
            {
              message.guild.members.resolve(user.id).roles.add(reward.value).catch(e => {});
            }
            else if(reward.reward_type == 'colorfree')
            {
              await Users_level.update({ colorfree: 1 }, {
                where: {
                  guild_id: message.guild.id,
                  user_id: user.id
                }
              });
            }
          });
        }
      });
    } 
  }
}
