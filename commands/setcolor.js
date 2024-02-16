const Discord = require('discord.js');
const { Op } = require('sequelize');
const {
  Colors,
  Users,
  Users_level,
  Color_inventory
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!args[0]) return message.channel.send(localization.usage.setcolor.replace(`{{preifx}}`, prefix));
  let colorId;
  if(isNaN(args[0]))
  {
    colorId = 0;
  }
  else
  {
    colorId = args[0];
  }

  const color = await Colors.findAll({
    where: {
      [Op.or]: [
        {
          color: {
            [Op.iLike]: `%${args[0]}%`
          },
          guild_id: message.guild.id
        },
        {
          id: colorId,
          guild_id: message.guild.id
        }
      ]
    }
  });

  if(color[0])
  {
    const user = await Users.findAll({
      where: {
        user_id: message.author.id
      }
    });

    const user_level = await Users_level.findAll({
      where: {
        user_id: message.author.id,
        guild_id: message.guild.id
      }
    });

    const usercolor = await Color_inventory.findAll({
      where: {
        user_id: message.author.id,
        color_id: color[0].id
      }
    });

    if(user[0].vip || usercolor[0] || user_level[0].colorfree)
    {
      message.member.roles.add(color[0].role_id).then(async () => {
        await Color_inventory.update({ equiped: true }, {
          where: {
            guild_id: message.guild.id,
            user_id: message.author.id,
            role_id: color[0].role_id
          }
        });

        await Color_inventory.update({ equiped: false }, {
          where: {
            guild_id: message.guild.id,
            user_id: message.author.id,
            role_id: {
              [Op.ne]: color[0].role_id
            }
          }
        });

        const othercolors = await Colors.findAll({
          where: {
            id: {
              [Op.ne]: color[0].id
            },
            guild_id: message.guild.id
          }
        });
  
        if(othercolors[0])
        {
          othercolors.forEach(function(colorRole) {
            message.member.roles.remove(colorRole.role_id).catch(e => {return message.reply(localization.ERROR_MODIFYING_ROLE)});
          });
        }

        message.reply(localization.COLOR_CHANGED.replace(`{{color}}`, color[0].color));
      }).catch((e) => {
        return message.reply(localization.ERROR_MODIFYING_ROLE);
      });
    }
    else
    {
      return message.reply(localization.DONT_HAVE_COLOR.replace(`{{prefix}}`, prefix));
    }
  }
  else
  {
    message.reply(localization.COLOR_DONT_EXISTS);
  }
}
