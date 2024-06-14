const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const {Op} = require('sequelize');
const {
	Users,
	Users_level,
	Xp_channels,
	Xp_roles,
	Level_rewards
} = require('./includes/tables.js');

const cooldown = require('./includes/cooldown.js');

exports.run = async ({ client, prefix, localization, message, sequelize, defcolor }) => {
	if(message.author.bot) return null;

	if(message.mentions.users.size)
	{
		if(!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.EmbedLinks) || message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.SendMessages)) return;
		if(message.mentions.users.first() == client.user.id)
		{
			const embed = new EmbedBuilder()
		      .setColor(defcolor)
		      .setAuthor({ name: client.user.username, iconURL: message.guild.iconURL() })
		      .setDescription(localization.usage.BOT_PING.replaceAll(`{{prefix}}`, prefix));
		    message.channel.send({embeds: [embed]});
			return;
		}
	}

	const userData = await Users.findAll({
		where: {
			user_id: message.author.id
		}
	});

	let userLevel = await Users_level.findAll({
		where: {
			user_id: message.author.id,
			guild_id: message.guild.id
		}
	});

	const xp_channel = await Xp_channels.findAll({
		where: {
			guild_id: message.guild.id,
			channel_id: message.channel.id
		}
	});

	if(xp_channel[0])
	{
		if(!cooldown.is('xp', message.author.id)) {
			cooldown.add('xp', message.author.id);

			let xpRate = 1;
			var today = new Date();
			if(today.getDay() == 6 || today.getDay() == 0)
			{
				xpRate = 2;
			}

			let randXP = Math.floor(((Math.random() * 5)+1)*xpRate);
			await Users_level.update({ xp: sequelize.literal(`xp + ${randXP}`) }, {
				where: {
					guild_id: message.guild.id,
					user_id: message.author.id
				}
			});

			let xp = userLevel[0].xp + randXP;
			let level = parseInt(userLevel[0].level);

			const next_role = await Xp_roles.findAll({
				where: {
					guild_id: message.guild.id,
					level: {
						[Op.gt]: userLevel[0].level
					}
				},
				order: [['level', 'ASC']],
				limit: 1
			});

			if(next_role[0])
			{
				if(next_role[0].xp <= xp)
				{
					message.member.roles.add(next_role[0].role_id);

					await Users_level.update({ level: next_role[0].level }, {
						where: {
							guild_id: message.guild.id,
							user_id: message.author.id
						}
					});

					const rewards = await Level_rewards.findAll({
						where: {
							level_id: next_role[0].role_id
						}
					});

					if(rewards[0])
					{
						rewards.forEach(async function(reward) {
							if(reward.reward_type == 'fb')
							{
								await Users.update({ ficha_comum: sequelize.literal(`ficha_comum + ${reward.value}`) }, {
									where: {
										user_id: message.author.id
									}
								});
							}
							else if(reward.reward_type == 'fr')
							{
								await Users.update({ ficha_rara: sequelize.literal(`ficha_rara + ${reward.value}`) }, {
									where: {
										user_id: message.author.id
									}
								});
							}
							else if(reward.reward_type == 'role')
							{
								message.guild.members.resolve(message.author.id).roles.add(reward.value);
							}
							else if(reward.reward_type == 'colorfree')
							{
								await Users_level.update({ colorfree: 1 }, {
									where: {
										guild_id: message.guild.id,
										user_id: message.author.id
									}
								});
							}
						});
					}
				}
			}
			else
			{
				const lastrole = await Xp_roles.findAll({
					where: {
						guild_id: message.guild.id,
						xp: {
							[Op.lte]: xp
						}
					},
					order: [['xp', 'DESC']],
					limit: 1
				});
			}

			setTimeout(() => {
				cooldown.remove('xp', message.author.id);
			}, 1000*60);
		}

		if(!cooldown.is('ficha', message.author.id)) {
			cooldown.add('ficha', message.author.id);

			await Users.update({ ficha_comum: sequelize.literal(`ficha_comum + 1`) }, {
				where: {
					user_id: message.author.id
				}
			});

			setTimeout(() => {
				cooldown.remove('ficha', message.author.id);
			}, (1000*60)*5);
		}
	}
}

/*if(!nextrole[0])
{
	con.query('SELECT * FROM xp_roles WHERE guild_id=' + message.guild.id + ' AND level < ' + level + ' ORDER BY level DESC LIMIT 1', async function (err, lastrole) {
		if(lastrole[0])
		{
			if(lastrole[0].xp > result[0].xp)
			{
				con.query('SELECT * FROM xp_roles WHERE guild_id=' + message.guild.id + ' AND xp<=' + xp + ' ORDER BY xp DESC LIMIT 1', async (err, curLastRole) => {
					if(curLastRole[0])
					{
						con.query('UPDATE users_level SET level='+curLastRole[0].level+' WHERE guild_id=' + message.guild.id + ' AND user_id='+message.author.id);
					}
				});
			}
		}
	});
}*/
