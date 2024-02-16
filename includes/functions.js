const {
    Users,
    Users_level,
    Xp_channels,
    Xp_roles
} = require('./tables.js');

async function registerUser(user, guild) {

	let userData = await Users.findAll({
		where: {
			user_id: user.id
		}
	});

	if(!userData[0])
	{
		userData = await Users.create({
			user_id: user.id,
			username: user.username
		});
		console.log(`\x1b[32m%s\x1b[0m`, `${user.username} registrado!`);
	}
	else
	{
		if(userData[0].username != user.username)
		{
			await Users.update({ username: user.username }, {
				where: {
					user_id: user.id
				}
			});
		}
	}

	if(!guild) return;

	let userLevel = await Users_level.findAll({
		where: {
			user_id: user.id,
			guild_id: guild.id
		}
	});

	if(!userLevel[0])
	{
		userLevel = await Users_level.create({
			guild_id: guild.id,
			user_id: user.id,
			username: user.username
		});
	}
	else
	{
		if(userLevel[0].username != user.username)
		{
			await Users_level.update({ username: user.username }, {
				where: {
					user_id: user.id
				}
			});
		}
	}
}

function paginate(array, page_size, page_number) {
	return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function checkSpam(message) {
	
	const badWords = [
		"steamcommunityx.com",
		"boostsgiftnitro.shop",
		"discocrd-gift",
		"discordg.link",
		"dlscordniltro",
		"discord-app.net",
		"discord.gg",
		"discord.com",
	]
}

module.exports = {
  registerUser,
	paginate
};