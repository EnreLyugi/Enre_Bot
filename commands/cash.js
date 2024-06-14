const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const {
  Users
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async ({ client, localization, message, defcolor }) => {
  let ficha_comum = client.emojis.cache.get(emojis.ficha_comum).toString();
  let ficha_rara = client.emojis.cache.get(emojis.ficha_rara).toString();

  const user = await Users.findAll({
    where: {
      user_id: message.author.id
    }
  });

  if(user)
  {
    let balance_fichaBranca = user[0].ficha_comum;
    let balance_fichaRoxa = user[0].ficha_rara;

    const embed = new EmbedBuilder()
        .setColor(defcolor)
        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL() })
        .setDescription(localization.YOU_HAVE + ':\n' + balance_fichaBranca + ' ' + ficha_comum + '\n' + balance_fichaRoxa + ' ' + ficha_rara);

    message.reply({embeds: [embed]});
  }
};
