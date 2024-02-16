const Discord = require('discord.js');
const {
  Colors
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);
  
  if(!args[0] || !args[1] || !args[2] || !args[3]) return message.reply(localization.usage.addcolor.replace(`{{prefix}}`, prefix));

  if(isNaN(args[1]) || isNaN(args[2])) return message.reply(localization.usage.addcolor.replace(`{{prefix}}`, prefix));

  let role = message.mentions.roles.first() || message.guild.roles.resolve(args[0]);

  if(!role) return message.reply(localization.ROLE_DONT_EXISTS);

  let role_id = role.id;

  args.shift();

  let pricec = args[0];

  args.shift();

  let pricer = args[0];

  args.shift();

  let color_name = '';

  args.forEach(function(color_text) {
    color_name = color_name + ' ' + color_text;
  });

  color_name = color_name.trimStart();

  const colors = await Colors.findAll({
    where: {
      role_id: role_id
    }
  });

  if(!colors[0])
  {
    await Colors.create({
      guild_id: message.guild.id,
      color: color_name,
      role_id: role_id,
      price_ficha_comum: pricec,
      price_ficha_rara: pricer
    });
    message.channel.send(localization.COLOR_ADDED.replace(`{{color_name}}`, color_name));
  }
  else
  {
    return message.reply(localization.COLOR_ALREADY_EXISTS_TO_ROLE);
  }
}
