const Discord = require('discord.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  client.emit("guildMemberAdd", message.member);
}
