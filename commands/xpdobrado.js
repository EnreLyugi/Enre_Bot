const Discord = require('discord.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  var today = new Date();
  if(today.getDay() == 0)
  {
    message.reply(localization.TODAY_IS_SUNDAY);
  }
  else if (today.getDay() == 1)
  {
    message.reply(localization.TODAY_IS_MONDAY);
  }
  else if (today.getDay() == 2)
  {
    message.reply(localization.TODAY_IS_TUESDAY);
  }
  else if (today.getDay() == 3)
  {
    message.reply(localization.TODAY_IS_WEDNESDAY);
  }
  else if (today.getDay() == 4)
  {
    message.reply(localization.TODAY_IS_THURSDAY);
  }
  else if (today.getDay() == 5)
  {
    message.reply(localization.TODAY_IS_FRIDAY);
  }
  else if (today.getDay() == 6)
  {
    message.reply(localization.TODAY_IS_SATURDAY);
  }
}
