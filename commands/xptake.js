const { PermissionsBitField } = require("discord.js");
const { Op } = require("sequelize");
const {
  Users_level,
  Xp_roles,
  Level_rewards,
} = require("../includes/tables.js");

exports.run = async ({ client, prefix, localization, message, args, sequelize }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
    return message.channel.send(
      localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION
    );

  if (!args[0] || !args[1])
    return message.channel.send(
      localization.usage.xptake.replace(`{{prefix}}`, prefix)
    );

  if (isNaN(args[0]))
    return message.channel.send(
      localization.usage.xptake.replace(`{{prefix}}`, prefix)
    );

  let user = message.mentions.users.first() || client.users.resolve(args[1]);

  let member = message.guild.members.resolve(user.id);

  if (!member) return message.channel.send(localization.USER_DONT_EXISTS);

  const user_data = await Users_level.findAll({
    where: {
      user_id: user.id,
      guild_id: message.guild.id,
    },
  });

  let curXP = parseInt(user_data[0].xp) - parseInt(args[0]);

  const roles = await Xp_roles.findAll({
    where: {
      guild_id: message.guild.id,
      xp: {
        [Op.gt]: curXP,
      },
    },
  });

  await Users_level.update(
    { xp: sequelize.literal(`xp - ${args[0]}`) },
    {
      where: {
        user_id: user.id,
        guild_id: message.guild.id,
      },
    }
  );

  if (roles[0]) {
    roles.forEach(async (role) => {
      member.roles.remove(role.role_id).catch((e) => {});

      const rewards = await Level_rewards.findAll({
        where: {
          level_id: role.role_id,
        },
      });

      if (rewards[0]) {
        rewards.forEach(async (reward) => {
          if (reward.reward_type == "role") {
            member.roles.remove(reward.value).catch((e) => {});
          } else if (reward.reward_type == "colorfree") {
            await Users_level.update(
              { colorfree: false },
              {
                where: {
                  guild_id: message.guild.id,
                  user_id: user.id,
                },
              }
            );
          }
        });
      }
    });

    const level = await Xp_roles.findAll({
      where: {
        guild_id: message.guild.id,
        xp: {
          [Op.lte]: curXP,
        },
      },
      order: [["xp", "DESC"]],
      limit: 1,
    });

    let newLevel = 0;
    if (level[0]) {
      newLevel = level[0].level;
    }

    await Users_level.update(
      { level: newLevel },
      {
        where: {
          user_id: user.id,
          guild_id: message.guild.id,
        },
      }
    );
  }

  message.reply(
    localization.XP_REMOVED.replace(`{{xp}}`, args[0]).replace(
      `{{member}}`,
      member
    )
  );
};
