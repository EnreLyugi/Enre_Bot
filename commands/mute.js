const Discord = require("discord.js");
const ms = require("ms");
const {
  Guild_vars,
  Users_level
} = require('../includes/tables.js')

module.exports.run = async (client, prefix, localization, message, args, sequelize, defcolor) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.channel.send(localization.REQUIRE_USER_MANAGE_ROLES_PERMISSION);

  if (!message.guild.me.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.reply(localization.REQUIRE_CLIENT_MANAGE_ROLES_PERMISSION);

  if(!args[0] || !args[1]) return message.reply(localization.usage.mute.replace(`{{prefix}}`, prefix));
  let tomuteusr = message.mentions.users.first() || client.users.resolve(args[0]);
  if(!tomuteusr) return message.reply(localization.USER_DONT_EXISTS);
  let tomute = message.guild.members.resolve(tomuteusr.id);
  if(!tomute) return message.reply(localization.USER_DONT_EXISTS);
  //if(tomute.permissions.has(Discord.Permissions.FLAGS.MANAGE_ROLES)) return message.reply("Você não tem permissão para usar este comando!");

  const guildVars = await Guild_vars.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  if(!guildVars[0].muted_role) return message.reply(localization.MUTED_ROLE_NOT_SET.replace(`{{prefix}}`, prefix));

  let muterole = message.guild.roles.resolve(guildVars[0].muted_role);

  let mutetime = args[1];
  if(!mutetime) return message.reply(localization.TIME_NOT_SPECIFIED);

  let reason = '';
  if(args[2])
  {
    reason = message.content.substr(message.content.indexOf(" ") + 1);
    reason = reason.substr(reason.indexOf(" ") + 1);
    reason = reason.substr(reason.indexOf(" ") + 1);
  }

  let timeformat = ms(ms(mutetime), { long: true });
  timeformat = timeformat.replace("seconds", localization.time_data.SECONDS).replace("second", localization.time_data.SECOND).replace("minutes", localization.time_data.MINUTES).replace("minute", localization.time_data.MINUTE).replace("hours", localization.time_data.HOURS).replace("hour", localization.time_data.HOUR).replace("days", localization.time_data.DAYS).replace("day", localization.time_data.DAY).replace("years", localization.time_data.YEARS).replace("year", localization.time_data.YEAR);

  await(tomute.roles.add(muterole).catch(e => {}), ['mute']);
  await Users_level.update({ muted: 1 }, {
    where: {
      guild_id: message.guild.id,
      user_id: tomute.id
    }
  });

  const mutedembed = new Discord.MessageEmbed()
    .setColor(defcolor)
    .setAuthor(message.guild.name, message.guild.iconURL())
    .setDescription(localization.MUTE_MESSAGE.replace(`{{member}}`, tomute).replace(`{{time}}`, timeformat));
  message.reply({embeds: [mutedembed]});

  if(reason == '')
  {
    reason = localization.REASON_NOT_INFORMED;
  }

  if(guildVars[0].log_chat)
  {
    let curDate = new Date();
    const mutedlog = new Discord.MessageEmbed()
      .setColor(defcolor)
      .setAuthor('Mute!', message.guild.iconURL())
      .setThumbnail(tomuteusr.displayAvatarURL({format: 'png'}))
      .addFields(
        {name: `🔇 ${localization.log_data.action}:`, value: `Mute!`},
        {name: `🔨 ${localization.log_data.author}:`, value: `${message.author}`},
        {name: `👤 ${localization.log_data.user}:`, value: `${tomute}`},
        {name: `⏰ ${localization.log_data.date_and_hour}:`, value: `${("0" + curDate.getDate()).slice(-2)}/${("0" + (curDate.getMonth() + 1)).slice(-2)}/${curDate.getFullYear()} ${("0" + curDate.getHours()).slice(-2)}:${("0" + curDate.getMinutes()).slice(-2)}:${("0" + curDate.getSeconds()).slice(-2)}`},
        {name: `⌛ ${localization.log_data.time}:`, value: `${timeformat}`},
        {name: `📜 ${localization.log_data.reason}:`, value: `${reason}`}
      )
      .setTimestamp();
    message.guild.channels.resolve(guildVars[0].log_chat).send({embeds: [mutedlog]});
  }

  const mutedpvembed = new Discord.MessageEmbed()
    .setColor(defcolor)
    .setAuthor(message.guild.name, message.guild.iconURL())
    .setDescription(localization.MUTED_PRIVATE_MESSAGE.replace(`{{guild_name}}`, message.guild.name).replace(`{{time}}`, timeformat).replace(`{{reason}}`, reason));
    tomuteusr.send({embeds: [mutedpvembed]}).catch(e => {});

  setTimeout(async function(){
    const check_muted = await Users_level.findAll({
      where: {
        guild_id: message.guild.id,
        user_id: tomute.id
      }
    });

    if(check_muted[0])
    {
      if(check_muted[0].muted == 1)
      {
        tomute.roles.remove(muterole.id).catch(e => {});

        await Users_level.update({ muted: 0 }, {
          where: {
            guild_id: message.guild.id,
            user_id: tomute.id
          }
        });

        const unmutedpvembed = new Discord.MessageEmbed()
          .setColor(defcolor)
          .setAuthor(message.guild.name, message.guild.iconURL())
          .setDescription(localization.UNMUTED_PRIVATE_MESSAGE.replace(`{{guild_name}}`, message.guild.name));
          tomuteusr.send({embeds: [unmutedpvembed]}).catch(e => {});
      }
    }
  }, ms(mutetime));
}
