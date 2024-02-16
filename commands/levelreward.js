const Discord = require('discord.js');
const config = require('../config.json');

const emojis = config.emojis;

exports.run = async (client, prefix, localization, message, args, con, defcolor, command) => {
  return message.reply(localization.COMMAND_DISABLED);
  if(!args[0] || !args[1]) return message.reply(`Uso: ${prefix}levelreward <level role> <role|fb|fr|colorfree> <parametro>`);

  let level_id = args[0].replace('<@&', '').replace('>', '');

  if(!message.guild.roles.resolve(level_id)) return message.reply('O cargo de level não existe!');

  con.query('SELECT * FROM xp_roles WHERE guild_id=' + message.guild.id + ' AND role_id=' + level_id, async (err, result) => {
    if(result[0])
    {
      let value;
      if(args[1] == 'fb' || args[1] == 'fr')
      {
        if(!args[2]) return message.reply(`Uso: ${prefix}levelreward <level role> <role|fb|fr|colorfree> <parametro>`);
        if(isNaN(args[2])) return message.reply('O valor da recompensa deve ser número!');
        value = args[2];
        let ficha;
        if(args[1] == 'fb')
        {
          ficha = client.emojis.cache.get(emojis.ficha_comum).toString();
        }
        else
        {
          ficha = client.emojis.cache.get(emojis.ficha_rara).toString();
        }
        message.reply('Adicionada a recompensa de ' + args[2] + ficha + ' para o level: ' + result[0].level);
      }
      else if (args[1] == 'role')
      {
        if(!args[2]) return message.reply(`Uso: ${prefix}levelreward <level role> <role|fb|fr|colorfree> <parametro>`);
        value = args[2].replace('<@&', '').replace('>', '');
        if(!message.guild.roles.resolve(level_id)) return message.reply('O cargo de recompensa não existe!');
        message.reply('Adicionado o cargo <@&' + value + '> de recompensa para o level: ' + result[0].level);
      }
      else if(args[1] == 'colorfree')
      {
        message.reply('Adicionada a recompensa de cores de graça para o level: ' + result[0].level);
      }
      else
      {
        return message.reply(`Uso: ${prefix}levelreward <level role> <role|fb|fr|colorfree> <parametro>`);
      }

      if(value)
      {
        con.query('INSERT INTO level_rewards (guild_id, level_id, reward_type, value) VALUES ("' + message.guild.id + '", "' + level_id + '", "' + args[1] + '", "' + value + '")');
      }
      else
      {
        con.query('INSERT INTO level_rewards (guild_id, level_id, reward_type) VALUES ("' + message.guild.id + '", "' + level_id + '", "' + args[1] + '")');
      }

      con.query('SELECT * FROM users_level WHERE guild_id=' + message.guild.id + ' AND level >= ' + result[0].level, async (err, users) => {
        if(users[0])
        {
         users.forEach(function(user) {
           if(args[1] == 'fb')
           {
             con.query('UPDATE users SET ficha_comum=ficha_comum+' + value + ' WHERE user_id=' + user.user_id);
           }
           else if(args[1] == 'fr')
           {
             con.query('UPDATE users SET ficha_comum=ficha_rara+' + value + ' WHERE user_id=' + user.user_id);
           }
           else if(args[1] == 'role')
           {
             message.guild.members.resolve(user.user_id).roles.add(value);
           }
           else if(args[1] == 'colorfree')
           {
             con.query('UPDATE users_level SET colorfree=1 WHERE guild_id=' + message.guild.id + ' AND user_id=' + user.user_id);
           }
         });
        }
      });
    }
    else
    {
      return message.reply('O cargo não é um cargo de level!');
    }
  });
};
