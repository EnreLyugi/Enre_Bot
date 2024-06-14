const { PermissionsBitField, EmbedBuilder } = require('discord.js');

exports.run = async ({ prefix, localization, message, defcolor}) => {
	let embed = new EmbedBuilder();

	if(localization.language == `portuguese`)
	{
		embed
			.setColor(defcolor)
			.setAuthor({ name: 'Comandos' })
			.setDescription("Lista de comandos do bot")
			.addFields(
				{ name: 'Comandos de usuário', value: '```' + prefix + 'profile - Mostra o perfil do usuário\n\n' + prefix +'status - Muda o status do perfil\n\n' + prefix +'daily - Recompensa diária\n\n' + prefix +'shop - Abre a loja```', inline: false },
				{ name: 'Comandos de diversão', value: '```' + prefix + 'ship <Usuário 1> <Usuário 2> - Porcentagem de ship```', inline: false },
				{ name: 'Comandos de cores', value: '```' + prefix + 'shop - Para comprar cores\n\n' + prefix +'setcolor <Nome/ID da cor> - para equipar uma cor```', inline: false },
				{ name: 'Comandos de música', value: '```' + prefix + 'play / ' + prefix + 'p <URL/Nome da Música> - Adiciona Músicas\n\n' + prefix + 'shuffle - Mistura a ordem das músicas\n\n' + prefix + 'skip - Pula para a próxima música da fila\n\n' + prefix + 'stop - para a música e limpa a fila\n\n' + prefix + 'volume <valor> - altera o volume da música```', inline: false }
			);
		if (message.member.permissions.has([PermissionsBitField.Flags.KickMembers]) || message.member.permissions.has([PermissionsBitField.Flags.BanMembers]))
		{
			embed.addFields({ name: 'Comandos de moderação', value: '```' + prefix + 'kick <user_id> <motivo> - para kickar um usuário\n\n' + prefix + 'ban <user_id> <motivo> - para banir um usuário\n\n' + prefix + 'adv <1|2|3> <usuário> - Adiciona uma advertência de nível `x` ao usuário```', inline: false });
		}
		if (message.member.permissions.has([PermissionsBitField.Flags.Administrator]))
		{
			embed.addFields({ name: 'Comandos de administrador', value: '```' + prefix + 'setlang <en_us / pt_br / es_es> - Muda o idioma\n\n' + prefix + 'autoshuffle - Mistura automaticamente as playlists do servidor\n\n' + prefix + 'prefix <Parâmetro> - Altera o prefixo do Bot\n\n' + prefix + 'xpgive <quantidade> <usuário> - Doa XP ao usuário\n\n' + prefix + 'xpreset - Reseta o XP de todos os usuários do servidor\n\n' + prefix + 'xptake <quantidade> <usuário> - Remove XP do usuário\n\n' + prefix + 'setchannel <join> <canal/id> - Configura o canal de boas-vindas\n\n' + prefix + 'unsetchannel <join> - Remove o canal de boas-vindas\n\n' + prefix + 'addxprole <cargo> <level> <xp> - Adiciona um cargo de XP\n\n' + prefix + 'addcolor <Cargo> <Preço Fichas Comuns> <Preço Fichas Raras> <Nome da Cor> - Adiciona uma cor à loja\n\n' + prefix + 'removecolor <Cargo> - Remove uma cor da loja\n\n' + prefix + 'advadd <1|2|3> <cargo> - Adiciona um cargo de advertência\n\n' + prefix + 'newembed - Cria um embed\n\n' + prefix + 'sendembed <ID> <Canal> - Envia um embed\n\n' + prefix + 'embeds - mostra a lista de embeds do servidor\n\n' + prefix + 'addviprole <Cargo> - Adiciona o cargo de VIPs```', inline: false });
		}
	}
	else
	{
		embed
			.setColor(defcolor)
			.setAuthor({ name: 'Commands' })
			.setDescription("Bot's command list")
			.addFields(
				{ name: 'User Commands', value: '```' + prefix + 'profile - Shows user profile\n\n' + prefix +'status - Change profile status\n\n' + prefix +'daily - Daily reward\n\n' + prefix +'shop - Open shop```', inline: false },
				{ name: 'Fun Commands', value: '```' + prefix + 'ship <user 1> <user 2> - Ship percentage```', inline: false },
				{ name: 'Color Commands', value: '```' + prefix + 'shop - Buy colors\n\n' + prefix +'setcolor <Color name/ID> - Equip color```', inline: false },
				{ name: 'Music Commands', value: '```' + prefix + 'play / ' + prefix + 'p <URL/Song name> - Add songs\n\n' + prefix + 'shuffle - Shuffle songs\n\n' + prefix + 'skip - Skip to the next song in queue\n\n' + prefix + 'stop - Stop song and clear queue\n\n' + prefix + 'volume <value> - Change song volume```', inline: false }
			);
		if (message.member.permissions.has([PermissionsBitField.Flags.KickMembers]) || message.member.permissions.has([PermissionsBitField.Flags.BanMembers]))
		{
			embed.addFields({ name: 'Moderation Commands', value: '```' + prefix + 'kick <user_id> <reason> - kick a user\n\n' + prefix + 'ban <user_id> <reason> - ban a user\n\n' + prefix + 'adv <1|2|3> <user> - Add advertence level `x` to the user```', inline: false });
		}
		if (message.member.permissions.has([PermissionsBitField.Flags.Administrator]))
		{
			embed.addFields({ name: 'Administration Commands', value: '```' + prefix + 'setlang <en_us / pt_br / es_es> - Change language\n\n' + prefix + 'autoshuffle - Shuffle playlists automatically on guild\n\n' + prefix + 'prefix <parameter> - Change the bot prefix\n\n' + prefix + 'xpgive <quantity> <user> - Gives XP to the user\n\n' + prefix + 'xpreset - Resets XP from all users on the guild\n\n' + prefix + 'xptake <quantity> <user> - Removes XP from the user\n\n' + prefix + 'setchannel <join | log> <channel/id> - Set the welcome/logs chat\n\n' + prefix + 'unsetchannel <join | log> - Unset the welcome/logs chat\n\n' + prefix + 'addxprole <role> <level> <xp> - Add a XP role\n\n' + prefix + 'addcolor <role> <Price common tokens> <Price rare tokens> <Color name> - Add a color to the shop\n\n' + prefix + 'removecolor <role> - Remove a color from the shop\n\n' + prefix + 'advadd <1|2|3> <role> - Add a advertence role\n\n' + prefix + 'newembed - Create an embed\n\n' + prefix + 'sendembed <ID> <channel> - Send an embed\n\n' + prefix + 'embeds - Show a list of the embeds of the guild\n\n' + prefix + 'addviprole <role> - add VIPs role```', inline: false });
		}
	}
	
  message.channel.send({embeds: [embed]});
}
