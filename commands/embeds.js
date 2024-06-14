const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {
  Embeds
} = require('../includes/tables.js');

exports.run = async ({ localization, message }) => {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  const embeds = Embeds.findAll({
    where: {
      guild_id: message.guild.id
    }
  });

  if(embeds[0])
  {
    let embedString = '';
    embeds.forEach(function(embed) {
      embedString = embedString + '\nID:' + embed.id + ' - ' + embed.name;
    });

    const embedList = new EmbedBuilder()
      .setColor('#540094')
      .setAuthor({ name: localization.GUILD_EMBEDS, iconURL: message.guild.iconURL() })
      .setDescription(embedString);
    message.channel.send({embeds: [embedList]});
  }
  else
  {
      message.reply(localization.NO_EMBEDS_ON_GUILD);
  }
}
