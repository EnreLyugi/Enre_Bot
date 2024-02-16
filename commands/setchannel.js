const Discord = require('discord.js');
const {
  Guild_vars
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0] || !args[1]) return message.channel.send(localization.usage.setchannel.replace(`{{prefix}}`, prefix));
  let channel = message.mentions.channels.first() || message.guild.channels.resolve(args[1]);

  if(!channel) return message.channel.send(localization.CHANNEL_DONT_EXISTS);

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

  await Guild_vars.update({ [column]: channel.id }, {
    where: {
      guild_id: message.guild.id
    }
  });

  message.channel.send(localization.CHANNEL_SET.replace(`{{channel}}`, channel).replace(`{{type}}`, channeltype));
};
