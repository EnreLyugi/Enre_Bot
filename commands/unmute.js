const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {
  Users_level,
  Guild_vars
} = require('../includes/tables');

exports.run = async ({ client, prefix, localization, message, args, defcolor }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return message.reply(localization.REQUIRE_USER_MANAGE_ROLES_PERMISSION);
  if(!args[0]) return message.reply(localization.usage.unmute.replace(`{{prefix}}`, prefix));

  let member = message.guild.members.resolve(message.mentions.users.first().id) || message.guild.members.resolve(args[0]);

  if(!member) return message.reply(localization.USER_DONT_EXISTS);

  const userData = await Users_level.findAll({
    where: {
      guild_id: message.guild.id,
      user_id: member.id
    }
  });

  if(userData[0].muted)
  {
    const guildVars = await Guild_vars.findAll({
      where: {
        guild_id: message.guild.id
      }
    });

    if(guildVars[0].muted_role)
    {
      member.roles.remove(guildVars[0].muted_role).catch(e => {});

      await Users_level.update({ muted: false }, {
        where: {
          guild_id: message.guild.id,
          user_id: member.id
        }
      });

      const mutedembed = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
        .setDescription(localization.UNMUTE_MESSAGE.replace(`{{member}}`, member));
      message.reply({embeds: [mutedembed]});

      const unmutedpvembed = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
        .setDescription(localization.UNMUTED_PRIVATE_MESSAGE.replace(`{{guild_name}}`, message.guild.name))
      client.users.resolve(member.id).send({embeds: [unmutedpvembed]}).catch(e => {});

      if(guildVars[0].log_chat)
      {
        let curDate = new Date();
        const mutedlog = new EmbedBuilder()
          .setColor(defcolor)
          .setAuthor({ name: 'UnMute!', iconURL: message.guild.iconURL() })
          .setThumbnail(client.users.resolve(member.id).displayAvatarURL({format: 'png'}))
          .addFields(
            {name: `🔊 ${localization.log_data.action}:`, value: `UnMute!`},
            {name: `🔨 ${localization.log_data.author}:`, value: `${message.author}`},
            {name: `👤 ${localization.log_data.user}:`, value: `${member}`},
            {name: `⏰ ${localization.log_data.date_and_hour}:`, value: `${("0" + curDate.getDate()).slice(-2)}/${("0" + (curDate.getMonth() + 1)).slice(-2)}/${curDate.getFullYear()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`},
          )
          .setTimestamp();
        message.guild.channels.resolve(guildVars[0].log_chat).send({embeds: [mutedlog]});
      }
    }
    else
    {
      message.reply(localization.MUTED_ROLE_NOT_SET);
    }
  }
  else
  {
    message.reply(localization.USER_NOT_MUTED);
  }
}
