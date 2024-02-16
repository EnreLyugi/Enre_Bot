const Discord = require('discord.js');
const {
  Users
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  return message.reply(localization.COMMAND_DISABLED);
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send('Este comando só pode ser utilizado por administradores!');

  if(isNaN(args[0]) || !args[0] || !args[1]) return message.channel.send(`Uso: ${prefix}giveficharara <valor> <usuário>`);

  let user = message.mentions.users.first() || client.users.resolve(args[1]);

  if(!user) return message.reply('Esse usuário não existe!');

  await Users.update({ ficha_rara: sequelize.literal(`ficha_rara + ${args[0]}`) }, {
    where: {
      user_id: user.id
    }
  });
  message.reply(`Você adicionou ${args[0]} fichas raras ao usuário!`);
}
