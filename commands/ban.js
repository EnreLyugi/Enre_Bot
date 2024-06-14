const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {
  Guild_vars,
  Bans
} = require('../includes/tables');

exports.run = async ({ client, prefix, localization, message, args, defcolor }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply(localization.REQUIRE_USER_BAN_MEMBERS_PERMISSION);

  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply(localization.REQUIRE_CLIENT_BAN_MEMBERS_PERMISSION);

  if(!args[0]) return message.channel.send(localization.usage.ban.replace(`{{prefix}}`, prefix));


  let reason = '';

  let member = message.mentions.members.first() || message.guild.members.resolve(args[0]);

  if(!member) return message.reply(localization.USER_DONT_EXISTS);

  if(args[1])
  {
    args.shift();
    reason = args.join(' ');
  }

  let banMessage = (reason != '') ? localization.BAN_MESSAGE_WITH_REASON.replace(`{{member}}`, member).replace(`{{reason}}`, reason) : localization.BAN_MESSAGE_WITHOUT_REASON.replace(`{{member}}`, member);

  const embed = new EmbedBuilder()
    .setColor(defcolor)
    .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
    .setDescription(banMessage);

  message.channel.send({embeds: [embed]})

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
      const banlog = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: 'Ban!', iconURL: message.guild.iconURL() })
        .setThumbnail(client.users.resolve(member.id).displayAvatarURL({extension: 'png'}))
        .addFields(
          {name: `🚫 ${localization.log_data.action}:`, value: `Ban`},
          {name: `🔨 ${localization.log_data.author}:`, value: `${message.author}`},
          {name: `👤 ${localization.log_data.user}:`, value: `${member}`},
          {name: `⏰ ${localization.log_data.date_and_hour}:`, value: `${("0" + curDate.getDate()).slice(-2)}/${("0" + (curDate.getMonth() + 1)).slice(-2)}/${curDate.getFullYear()} ${("0" + curDate.getHours()).slice(-2)}:${("0" + curDate.getMinutes()).slice(-2)}:${("0" + curDate.getSeconds()).slice(-2)}`},
          {name: `📜 ${localization.log_data.reason}:`, value: `${reason}`}
        )
        .setTimestamp();
      message.guild.channels.resolve(guild_vars[0].log_chat).send({embeds: [banlog]});
    }
  }

  await Bans.create({
    guild_id: message.guild.id,
    user_id: member.id,
    username: client.users.resolve(member.id).username,
    reason: reason,
    author_id: message.author.id,
    author_username: message.author.username
  });
  
  message.guild.members.ban(member.id, {reason: reason + " | " + message.author.tag + " (" + message.author.id + ")"}).catch(e => {});
}
