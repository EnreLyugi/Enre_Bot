const Discord = require('discord.js');
const config = require('../config.json');
const { Op } = require('sequelize');
const {
  Users_level,
  Xp_roles
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async (client, prefix, localization, message, args, sequelize, defcolor, command) => {
  let top3 = client.emojis.cache.get(emojis.top3).toString();
  let rank = client.emojis.cache.get(emojis.rank).toString();

  const usersLevel = await Users_level.findAll({
    where: {
      guild_id: message.guild.id
    },
    order: [['xp', 'DESC']]
  });

  let response = '';
  let i = 0;

  for(const user of usersLevel) {
    let member = message.guild.members.resolve(user.user_id);
    let xp = user.xp;
    let level = user.level;

    const next_level = await Xp_roles.findAll({
      where: {
        xp: {
          [Op.gt]: xp
        },
        guild_id: message.guild.id
      },
      order: [['xp', 'ASC']],
      limit: 1
    });
  
    if(next_level[0])
    {
      let nextLevel = next_level[0].level;
      let nextLevelXP = next_level[0].xp;
      let lastLevel = 0;
      let lastLevelXP = 0;
  
      const last_level = await Xp_roles.findAll({
        where: {
          xp: {
            [Op.lte]: xp
          },
          guild_id: message.guild.id
        },
        order: [['xp', 'DESC']],
        limit: 1
      });
  
      if(last_level[0])
      {
        lastLevel = last_level[0].level;
        lastLevelXP = last_level[0].xp;
      }
  
      let xpGap = nextLevelXP - lastLevelXP;
      let levelGap = nextLevel - lastLevel;
  
      let midGap = xpGap / levelGap;
  
      let curXP = lastLevelXP;
      let counter = 0;
  
      while(curXP <= xp)
      {
        curXP += midGap;
        counter++;
      }
      level = lastLevel + counter;
  
      if(level < 0)
      {
        level = 0;
      }
    }

    if(member)
    {
      response = response + `\n` + localization.TOP_INDEX.replace(`{{emote}}`, (i <= 2) ? top3 : rank).replace(`{{index}}`, i+1).replace(`{{member}}`, member).replace(`{{level}}`, level).replace(`{{xp}}`, xp);
      i++;
    }
    if(i == 10) {
      let embed = new Discord.MessageEmbed()
        .setColor(defcolor)
        .setAuthor(localization.TOP_TITLE, message.guild.iconURL())
        .setDescription(response);
      message.channel.send({embeds: [embed]});
      return;
    }
  }
  let embed = new Discord.MessageEmbed()
    .setColor(defcolor)
    .setAuthor(localization.TOP_TITLE, message.guild.iconURL())
    .setDescription(response);
  message.channel.send({embeds: [embed]});
}
