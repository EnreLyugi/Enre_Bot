const config = require('../config.json');
const {
  Users,
  Daily
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async ({ client, localization, message, sequelize }) => {
	const channel = message.channel;
	const member = message.member;

	let ficha_comum = client.emojis.cache.get(emojis.ficha_comum).toString();

	let user = message.author;

  const userData = await Users.findAll({
    where: {
      user_id: user.id
    }
  });
  let reward = 100;
  if(userData[0].vip)
  {
    reward = 200;
  }

  const daily = await Daily.findAll({
    where: {
      user_id: user.id
    }
  });

  if(daily[0])
  {
    dailyDate = new Date(daily[0].date);
    const dateCheck = await isToday(dailyDate);
    if(dateCheck) return channel.send(localization.YOU_ALREADY_GOT_YOUR_DAILY);

    await Daily.update({ username: user.username, num_dailies: sequelize.literal(`num_dailies+1`) }, {
      where: {
        user_id: user.id
      }
    });
  }
  else
  {
    await Daily.create({
      user_id: user.id,
      username: user.username
    });    
  }

  await Users.update({ ficha_comum: sequelize.literal(`ficha_comum+${reward}`) }, {
    where: {
        user_id: user.id
    }
  });

  channel.send(`${localization.YOU_RECEIVED} ${reward}${ficha_comum}`);
}

const isToday = (dailyDate) => {
  const today = new Date()
  return dailyDate.getDate() == today.getDate() &&
    dailyDate.getMonth() == today.getMonth() &&
    dailyDate.getFullYear() == today.getFullYear()
}
