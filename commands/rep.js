const {
  Rep,
  Users
} = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args, sequelize }) => {
  if(!args[0]) return message.reply(localization.usage.rep.replace(`{{prefix}}`, prefix));

  let user = message.guild.members.resolve(message.mentions.members.first().id) || message.guild.members.resolver(args[0])

  if(user.bot) return message.reply(localization.CANNOT_REP_BOT);

  if(message.author.id == user.id) return message.reply(localization.CANNOT_REP_YOURSELF);

  if(!message.guild.members.resolve(user.id)) return message.reply(localization.USER_DONT_EXISTS);

  const rep = await Rep.findAll({
    where: {
      user_id: message.author.id
    }
  });

  if(rep[0])
  {
    let dailyDate = new Date(rep[0].date);
    const dateCheck = isToday(dailyDate);
    if(dateCheck) return message.reply(localization.ALREADY_REP_TODAY);

    await Rep.update({ num_reps: sequelize.literal(`num_reps + 1`) }, {
      where: {
        user_id: message.author.id
      }
    });

    await Users.update({ rep: sequelize.literal(`rep + 1`) }, {
      where: {
        user_id: user.id
      }
    });
  }
  else
  {
    await Rep.create({
      user_id: message.author.id,
      username: message.author.username,
      num_reps: 1
    });

    await Users.update({ rep: sequelize.literal(`rep + 1`) }, {
      where: {
        user_id: user.id
      }
    });
  }

  message.reply(localization.REP_SENT.replace(`{{user}}`, user));
};

const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}
