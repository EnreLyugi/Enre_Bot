const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {
  Embeds
} = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0] || !args[1]) return message.channel.send(localization.usage.sendembed.replace(`{{prefix}}`, prefix));

  let channel = message.mentions.channels.first() || message.guild.channels.resolve(args[1]);

  if(!channel) return message.channel.send(localization.CHANNEL_DONT_EXISTS);

  const embed = await Embeds.findAll({
    where: {
      id: args[0],
      guild_id: message.guild.id
    }
  });

  if(embed[0])
  {
    const embedM = new EmbedBuilder()
      .setColor(embed[0].color)
      .setAuthor({ name: embed[0].title, iconURL: message.guild.iconURL()})
      .setDescription(embed[0].content);
    channel.send({embeds: [embedM]}).catch(e => {message.reply(localization.ERROR_SENDING_MESSAGE)});
  }
  else
  {
    message.reply(localization.EMBED_DONT_EXISTS);
  }
}
