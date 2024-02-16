const Discord = require('discord.js');
const {
  Xp_channels
} = require('../includes/tables.js')

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0]) return message.reply(localization.usage.enablexp.replace(`{{prefix}}`, prefix));

  let channel = message.mentions.channels.first() || message.guild.channels.resolve(args[0]);

  if(!channel) return message.reply(localization.CHANNEL_DONT_EXISTS);

  const xpChannel = await Xp_channels.findAll({
    where: {
      channel_id: channel.id
    }
  });

  if(!xpChannel[0])
  {
    await Xp_channels.create({
      guild_id: message.guild.id,
      channel_id: channel.id
    });

    message.reply(localization.ENABLED_XP_ON_CHANNEL.replace(`{{channel}}`, channel));
  }
  else 
  {
    message.reply(localization.XP_ALREADY_ENABLED_ON_CHANNEL.replace(`{{channel}}`, channel));
  }
}
