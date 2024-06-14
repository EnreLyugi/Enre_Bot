const { EmbedBuilder } = require('discord.js');

exports.run = async ({ localization, message, defcolor }) => {
  var today = new Date();
  var days = [
    localization.TODAY_IS_SUNDAY,
    localization.TODAY_IS_MONDAY,
    localization.TODAY_IS_TUESDAY,
    localization.TODAY_IS_WEDNESDAY,
    localization.TODAY_IS_THURSDAY,
    localization.TODAY_IS_FRIDAY,
    localization.TODAY_IS_SATURDAY,
  ];

  let response = new EmbedBuilder()
    .setColor(defcolor)
    .setTitle("XP Dobrado")
    .setDescription(days[today.getDay()]);

  message.reply({ embeds: [response] });
};

