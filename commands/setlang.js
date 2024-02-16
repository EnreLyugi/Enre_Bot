const Discord = require('discord.js');
const {
    Guild_vars
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.reply(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if(!args[0] || (args[0] != 'en_us' && args[0] != 'pt_br' && args[0] != 'es_es' && args[0] != 'jp_jp')) return message.reply(localization.usage.setlang.replace(`{{prefix}}`, prefix));

  if(localization.language == 'english' && args[0] == 'en_us') return message.reply(`Bot is already in english`);
  if(localization.language == 'portuguese' && args[0] == 'pt_br') return message.reply(`O bot já está em português`);
  if(localization.language == 'spanish' && args[0] == 'es_es') return message.reply(`El bot ya esta en español`);
  if(localization.language == 'japanese' && args[0] == 'jp_jp') return message.reply(`ボットはすでに日本語です`);

  let language = 'english';
  if(args[0] == 'pt_br')
  {
    language = 'portuguese';
  }
  else if(args[0] == 'es_es')
  {
    language = 'spanish';
  }
  else if(args[0] == 'jp_jp')
  {
    language = 'japanese';
  }

  await Guild_vars.update({ language: language }, {
    where: {
      guild_id: message.guild.id
    }
  });

  if(language == 'english')
  {
    message.reply(`Language set to english!`);
  }
  else if(language == 'portuguese')
  {
    message.reply(`Idioma alterado para português!`);
  }
  else if(language == 'spanish')
  {
    message.reply(`¡Idioma cambiado a español!`);
  }
  else if(language == 'japanese')
  {
    message.reply(`言語が日本語に変わりました！`);
  }

  let guildQueue = await client.player.getQueue(message.guild.id);
	if(!guildQueue) return;

  guildQueue.data.language = language;
};