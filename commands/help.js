const Discord = require('discord.js');

exports.run = async (client, prefix, localization, message, args, sequelize, defcolor) => {
	let embed = new Discord.MessageEmbed()

	if(localization.language == `portuguese`)
	{
		embed
			.setColor(defcolor)
			.setAuthor('Comandos')
			.setDescription("Lista de comandos do bot")
			.addField('Comandos de usuário', '```' + prefix + 'profile - Mostra o perfil do usuário\n\n' + prefix +'status - Muda o status do perfil\n\n' + prefix +'daily - Recompensa diária\n\n' + prefix +'shop - Abre a loja```', false)
			.addField('Comandos de diversão', '```' + prefix + 'ship <Usuário 1> <Usuário 2> - Porcentagem de ship```', false)
			.addField('Comandos de cores', '```' + prefix + 'shop - Para comprar cores\n\n' + prefix +'setcolor <Nome/ID da cor> - para equipar uma cor```', false)
			.addField('Comandos de música', '```' + prefix + 'play / ' + prefix + 'p <URL/Nome da Música> - Adiciona Músicas\n\n' + prefix + 'shuffle - Mistura a ordem das músicas\n\n' + prefix + 'skip - Pula para a próxima música da fila\n\n' + prefix + 'stop - para a música e limpa a fila\n\n' + prefix + 'volume <valor> - altera o volume da música```', false);
		if (message.member.permissions.has([Discord.Permissions.FLAGS.KICK_MEMBERS]) || message.member.permissions.has([Discord.Permissions.FLAGS.BAN_MEMBERS]))
		{
			embed
			.addField('Comandos de moderação', '```' + prefix + 'kick <user_id> <motivo> - para kickar um usuário\n\n' + prefix + 'ban <user_id> <motivo> - para banir um usuário\n\n' + prefix + 'adv <1|2|3> <usuário> - Adiciona uma advertência de nível `x` ao usuário```', false);
		}
		if (message.member.permissions.has([Discord.Permissions.FLAGS.ADMINISTRATOR]))
		{
			embed
			.addField('Comandos de administrador', '```' + prefix + 'setlang <en_us / pt_br / es_es> - Muda o idioma\n\n' + prefix + 'autoshuffle - Mistura automaticamente as playlists do servidor\n\n' + prefix + 'prefix <Parâmetro> - Altera o prefixo do Bot\n\n' + prefix + 'xpgive <quantidade> <usuário> - Doa XP ao usuário\n\n' + prefix + 'xpreset - Reseta o XP de todos os usuários do servidor\n\n' + prefix + 'xptake <quantidade> <usuário> - Remove XP do usuário\n\n' + prefix + 'setchannel <join> <canal/id> - Configura o canal de boas-vindas\n\n' + prefix + 'unsetchannel <join> - Remove o canal de boas-vindas\n\n' + prefix + 'addxprole <cargo> <level> <xp> - Adiciona um cargo de XP\n\n' + prefix + 'addcolor <Cargo> <Preço Fichas Comuns> <Preço Fichas Raras> <Nome da Cor> - Adiciona uma cor à loja\n\n' + prefix + 'removecolor <Cargo> - Remove uma cor da loja\n\n' + prefix + 'advadd <1|2|3> <cargo> - Adiciona um cargo de advertência\n\n' + prefix + 'newembed - Cria um embed\n\n' + prefix + 'sendembed <ID> <Canal> - Envia um embed\n\n' + prefix + 'embeds - mostra a lista de embeds do servidor\n\n' + prefix + 'addviprole <Cargo> - Adiciona o cargo de VIPs```', false);
		}
	}
	else
	{
		embed
			.setColor(defcolor)
			.setAuthor('Commands')
			.setDescription("Bot's command list")
			.addField('User Commands', '```' + prefix + 'profile - Shows user profile\n\n' + prefix +'status - Change profile status\n\n' + prefix +'daily - Daily reward\n\n' + prefix +'shop - Open shop```', false)
			.addField('Fun Commands', '```' + prefix + 'ship <user 1> <user 2> - Ship percentage```', false)
			.addField('Color Commands', '```' + prefix + 'shop - Buy colors\n\n' + prefix +'setcolor <Color name/ID> - Equip color```', false)
			.addField('Music Commands', '```' + prefix + 'play / ' + prefix + 'p <URL/Song name> - Add songs\n\n' + prefix + 'shuffle - Shuffle songs\n\n' + prefix + 'skip - Skip to the next song in queue\n\n' + prefix + 'stop - Stop song and clear queue\n\n' + prefix + 'volume <value> - Change song volume```', false);
		if (message.member.permissions.has([Discord.Permissions.FLAGS.KICK_MEMBERS]) || message.member.permissions.has([Discord.Permissions.FLAGS.BAN_MEMBERS]))
		{
			embed
			.addField('Moderation Commands', '```' + prefix + 'kick <user_id> <reason> - kick a user\n\n' + prefix + 'ban <user_id> <reason> - ban a user\n\n' + prefix + 'adv <1|2|3> <user> - Add advertence level `x` to the user```', false);
		}
		if (message.member.permissions.has([Discord.Permissions.FLAGS.ADMINISTRATOR]))
		{
			embed
			.addField('Administration Commands', '```' + prefix + 'setlang <en_us / pt_br / es_es> - Change language\n\n' + prefix + 'autoshuffle - Shuffle playlists automatically on guild\n\n' + prefix + 'prefix <parameter> - Change the bot prefix\n\n' + prefix + 'xpgive <quantity> <user> - Gives XP to the user\n\n' + prefix + 'xpreset - Resets XP from all users on the guild\n\n' + prefix + 'xptake <quantity> <user> - Removes XP from the user\n\n' + prefix + 'setchannel <join | log> <channel/id> - Set the welcome/logs chat\n\n' + prefix + 'unsetchannel <join | log> - Unset the welcome/logs chat\n\n' + prefix + 'addxprole <role> <level> <xp> - Add a XP role\n\n' + prefix + 'addcolor <role> <Price common tokens> <Price rare tokens> <Color name> - Add a color to the shop\n\n' + prefix + 'removecolor <role> - Remove a color from the shop\n\n' + prefix + 'advadd <1|2|3> <role> - Add a advertence role\n\n' + prefix + 'newembed - Create an embed\n\n' + prefix + 'sendembed <ID> <channel> - Send an embed\n\n' + prefix + 'embeds - Show a list of the embeds of the guild\n\n' + prefix + 'addviprole <role> - add VIPs role```', false);
		}
	}
	
  message.channel.send({embeds: [embed]});
}
