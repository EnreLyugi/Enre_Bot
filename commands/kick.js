const Discord = require('discord.js');
const {
  Guild_vars,
  Kicks
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize, defcolor, command) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.KICK_MEMBERS)) return message.reply(localization.REQUIRE_USER_KICK_MEMBERS_PERMISSION);

  if (!message.guild.me.permissions.has(Discord.Permissions.FLAGS.KICK_MEMBERS)) return message.reply(localization.REQUIRE_CLIENT_KICK_MEMBERS_PERMISSION);

  if(!args[0]) return message.channel.send(localization.usage.kick.replace(`{{prefix}}`, prefix));

  let reason = '';

  let member = message.mentions.members.first() || message.guild.members.resolve(args[0]);

  if(!member) return message.reply(localization.USER_DONT_EXISTS);

  if(args[1])
  {
    args.shift();
    reason = args.join(' ');
  }

  let kickMessage = (reason != '') ? localization.KICK_MESSAGE_WITH_REASON.replace(`{{member}}`, member).replace(`{{reason}}`, reason) : localization.KICK_MESSAGE_WITHOUT_REASON.replace(`{{member}}`, member);

  const embed = new Discord.MessageEmbed()
    .setColor(defcolor)
    .setAuthor(message.guild.name, message.guild.iconURL())
    .setDescription(kickMessage);

  message.channel.send({embeds: [embed]})

  message.guild.members.kick(member.id, reason).catch(e => {});

  await Kicks.create({
    guild_id: message.guild.id,
    user_id: member.id,
    username: client.users.resolve(member.id).username,
    reason: reason,
    author_id: message.author.id,
    author_username: message.author.username
  });

  const guild_vars = await Guild_vars.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  if(guild_vars[0])
  {
    if(guild_vars[0].log_chat)
    {
      if(reason == '')
      {
        reason = localization.REASON_NOT_INFORMED;
      }
      let curDate = new Date();
      const mutedlog = new Discord.MessageEmbed()
        .setColor(defcolor)
        .setAuthor('Kick!', message.guild.iconURL())
        .setThumbnail(client.users.resolve(member.id).displayAvatarURL({format: 'png'}))
        .addFields(
          {name: `💥 ${localization.log_data.action}:`, value: `Kick`},
          {name: `🔨 ${localization.log_data.author}:`, value: `<@${message.author.id}>`},
          {name: `👤 ${localization.log_data.user}:`, value: `${member}`},
          {name: `⏰ ${localization.log_data.date_and_hour}:`, value: `${("0" + curDate.getDate()).slice(-2)}/${("0" + (curDate.getMonth() + 1)).slice(-2)}/${curDate.getFullYear()} ${("0" + curDate.getHours()).slice(-2)}:${("0" + curDate.getMinutes()).slice(-2)}:${("0" + curDate.getSeconds()).slice(-2)}`},
          {name: `📜 ${localization.log_data.reason}:`, value: `${reason}`}
        )
        .setTimestamp();
      message.guild.channels.resolve(guild_vars[0].log_chat).send({embeds: [mutedlog]});
    }
  }
}
