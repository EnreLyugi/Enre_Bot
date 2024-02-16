const Discord = require('discord.js');
const config = require('../config.json');

const emojis = config.emojis;

exports.run = async (client, prefix, localization, message, args, con, defcolor, command) => {
  return message.reply(localization.COMMAND_DISABLED);
  let top3 = client.emojis.cache.get(emojis.top3).toString();
  let rank = client.emojis.cache.get(emojis.rank).toString();
  let ficha_comum = client.emojis.cache.get(emojis.ficha_comum).toString();
  let ficha_rara = client.emojis.cache.get(emojis.ficha_rara).toString();
  con.query('SELECT * FROM users ORDER BY (ficha_rara*2000)+ficha_comum DESC LIMIT 10', function (err, result) {
			if(!err)
			{
				if(result[0])
				{
					let response = '';
					let i = 1;
					result.forEach( function(row) {
            if(client.users.resolve(row.user_id))
            {
              if(i <= 3)
              {
                response = response + '\n' + top3 + ' **' + i + ' ❱** <@' + row.user_id + '> possui **' + row.ficha_comum + ficha_comum + '** e **' + row.ficha_rara + ficha_rara + '**';
              }
              else
              {
                response = response + '\n' + rank + ' **' + i + ' ❱** <@' + row.user_id + '> possui **' + row.ficha_comum + ficha_comum + '** e **' + row.ficha_rara + ficha_rara + '**';
              }
  						i++;
            }
					});
          const embed = new Discord.MessageEmbed()
            .setColor(defcolor)
            .setAuthor('TOP 10 do Servidor!', message.guild.iconURL())
            .setDescription(response);
					message.channel.send({embeds: [embed]});
				}
			}
		});
};
