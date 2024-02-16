const Discord = require('discord.js');
const {
  Guild_vars
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
  
  if(!args[0]) return message.channel.send(localization.usage.unsetchannel.replace(`{{prefix}}`, prefix));

  let column = '';
  let channeltype = '';

  if(args[0] == 'join')
  {
    column = 'welcome_chat';
    channeltype = localization.TYPE_CHANNEL_WELCOME;
  }
  else if(args[0] == 'left')
  {
    column = 'exit_chat';
    channeltype = localization.TYPE_CHANNEL_EXIT;
  }
  else if(args[0] == 'log')
  {
    column = 'log_chat';
    channeltype = localization.TYPE_CHANNEL_LOG;
  }
  else
  {
    return null;
  }

  await sequelize.query(`UPDATE "guild_vars" SET "${column}"=NULL`, { type: sequelize.QueryTypes.UPDATE });
  message.channel.send(localization.CHANNEL_REMOVED.replace(`{{type}}`, channeltype));
};
