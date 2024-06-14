const { PermissionsBitField } = require('discord.js');
const {
	Guild_vars
 } = require('../includes/tables.js');

exports.run = async ({ prefix, localization, message, args }) => {
  	if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
	if(!args[0]) return message.channel.send(localization.usage.prefix.replace(`{{prefix}}`, prefix));

	const guild_vars = await Guild_vars.findAll({
		where: {
			guild_id: message.guild.id
		}
	});

	if(guild_vars[0])
	{
		var prefix = guild_vars[0].prefix;
		await Guild_vars.update({ prefix: args[0] }, {
			where: {
				guild_id: message.guild.id
			}
		});
		message.channel.send(localization.PREFIX_CHANGED.replace(`{{prefix}}`, args[0]));
	}
}
