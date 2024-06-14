const { PermissionsBitField, EmbedBuilder, MessageCollector } = require('discord.js');
const config = require('../config.json');
const {
  Colors,
  Color_inventory,
  Users
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async ({ client, localization, message, sequelize, defcolor }) => {

  if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) return message.reply(localization.REQUIRE_CLIENT_MANAGE_EMOJIS_AND_STICKERS_PERMISSION);

  let ficha_comum = client.emojis.cache.get(emojis.ficha_comum).toString();
  let ficha_rara = client.emojis.cache.get(emojis.ficha_rara).toString();
  let bag = client.emojis.cache.get(emojis.bag).toString();
  let palette = client.emojis.cache.get(emojis.palette).toString();

  const shopEmbed = new EmbedBuilder()
    .setColor(defcolor)
    .setAuthor({ name: localization.COLORS_SHOP, iconURL: message.guild.iconURL() })
    .setDescription(localization.SHOP_WELCOME.replace(`{{bag}}`, bag).replace(`{{palette}}`, palette))
  const shopm = await message.reply({embeds: [shopEmbed]});
  
  await shopm.react(emojis.bag);
  await shopm.react(emojis.palette);

  const filter = (reaction, user) => {
      return [emojis.bag, emojis.palette].includes(reaction.emoji.id) && user.id == message.author.id;
  };

  const collector = shopm.createReactionCollector(filter, {
      max: 1,
      time: 30000,
      errors: ['time']
  });

  collector.on('collect', async (reaction, user) => {
      if(user.id != message.author.id) return;
      //const reaction = reaction.first();

      if(reaction.emoji.id === emojis.bag)
      {
        shopm.reactions.removeAll().catch(e => {});
        shopm.edit({content: localization.ITEM_SHOP_SOON.replace(`{{author}}`, message.author), embeds: []});
      }
      else if(reaction.emoji.id === emojis.palette)
      {
        shopm.reactions.removeAll().catch(e => {});

        const guildColors = await Colors.findAll({
          where: {
            guild_id: message.guild.id
          }
        });

        if(guildColors[0])
        {
          let shoplist = '';
          let colors = [];
          let i = 0;
          guildColors.forEach(function(color) {
            i++;
            if(i <= 30)
            {
              shoplist += `${i} - <@&${color.role_id}>   -   ${localization.PRICE}: ${ficha_comum} ${color.price_ficha_comum} ${ficha_rara} ${color.price_ficha_rara}\n`;
              colors[i] = {id: color.id, color: color.color, role_id: color.role_id, pricec: color.price_ficha_comum, pricer: color.price_ficha_rara};
            }
          });

          shoplist = shoplist + '\n' + localization.TYPE_COLOR_NUMBER;
          const shopembed = new EmbedBuilder()
            .setColor(defcolor)
            .setAuthor({ name: localization.COLORS_SHOP, iconURL: message.guild.iconURL() })
            .setDescription(shoplist)
          shopm.edit({embeds: [shopembed]});
          const collector = new MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
          collector.on('collect', async response => {
            if(colors[response.content])
            {
              const hasColor = await Color_inventory.findAll({
                where: {
                  user_id: response.author.id,
                  guild_id: response.guild.id,
                  role_id: colors[response.content].role_id
                }
              });

              if(hasColor[0]) return response.channel.send(localization.ALREADY_BOUGHT_COLOR);

              const user_data = await Users.findAll({
                where: {
                  user_id: response.author.id
                }
              });

              if(user_data[0].ficha_comum < colors[response.content].pricec || user_data[0].ficha_rara < colors[response.content].pricer) return response.channel.send(localization.DONT_HAVE_ENOUGHT_MONEY);

              const color_inv = await Color_inventory.findAll({
                where: {
                  equiped: true,
                  guild_id: response.guild.id,
                  user_id: response.author.id
                }
              });

              if(color_inv[0])
              {
                response.member.roles.remove(color_inv[0].role_id).then(async () => {
                  await Color_inventory.update({ equiped: false }, {
                    where: {
                      equiped: true,
                      guild_id: response.guild.id,
                      user_id: response.author.id
                    }
                  });
                }).catch((e) => {
                  return message.reply(localization.ERROR_MODIFYING_ROLE);
                });
              }

              response.member.roles.add(colors[response.content].role_id).then(async () => {
                await Color_inventory.create({
                  guild_id: response.guild.id,
                  user_id: response.author.id,
                  username: response.author.username,
                  color_id: colors[response.content].id,
                  role_id: colors[response.content].role_id,
                  equiped: true
                });

                response.channel.send(localization.COLOR_BOUGHT.replace(`{{author}}`, message.author).replace(`{{color}}`, colors[response.content].color));

                await Users.update({ ficha_comum: sequelize.literal(`ficha_comum-${colors[response.content].pricec}`), ficha_rara: sequelize.literal(`ficha_rara-${colors[response.content].pricer}`) }, {
                  where: {
                    user_id: response.author.id
                  }
                });
              }).catch((e) => {
                return message.reply(localization.ERROR_MODIFYING_ROLE)
              });

              if(response) {response.delete().catch(e => {});}
              if(message) {message.delete().catch(e => {});}
              if(shopm) {shopm.delete().catch(e => {});}
              collector.stop();
            }
            else if(response.content == 0)
            {
              if(response) {response.delete().catch(e => {});}
              if(message) {message.delete().catch(e => {});}
              if(shopm) {shopm.delete().catch(e => {});}
              collector.stop();
            }
          });
          collector.on('end', collected => {
            if(message) {message.delete().catch(e => {});}
            if(shopm) {shopm.delete().catch(e => {});}
          });
        }
        else
        {
          shopm.edit({content: localization.THERE_ARE_NO_COLORS.replace(`{{author}}`, message.author), embeds: []});
        }
      }
  })
  /*.catch(collected => {
      shopm.delete();
  })*/;
}
