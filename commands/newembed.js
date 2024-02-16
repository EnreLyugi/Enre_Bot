const Discord = require('discord.js');
const config = require('../config.json');
const {
  Embeds
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(localization.REQUIRE_USER_ADMINISTRATOR_PERMISSION);

  if (!message.guild.me.permissions.has(Discord.Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) return message.reply(localization.REQUIRE_CLIENT_MANAGE_EMOJIS_AND_STICKERS_PERMISSION);

  const settings = await message.reply(localization.TYPE_A_COLOR);
  const collector1 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
  collector1.on('collect', response => {
      if(response.content == '0')
      {
        response.delete();
        message.delete();
        settings.delete();
        collector1.stop();
      }
      else
      {
        collector1.stop();
        let embedColor = response.content;
        response.delete();
        settings.edit(localization.TYPE_A_TITLE);
        const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
        collector2.on('collect', response2 => {
            if(response2.content == '0')
            {
              response2.delete();
              message.delete();
              settings.delete();
              collector2.stop();
            }
            else
            {
              collector2.stop();
              let embedTitle = response2.content;
              response2.delete();
              settings.edit(localization.TYPE_A_CONTENT);
              const collector3 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
              collector3.on('collect', response3 => {
                  if(response3.content == '0')
                  {
                    response3.delete();
                    message.delete();
                    settings.delete();
                    collector3.stop();
                  }
                  else
                  {
                    collector3.stop();
                    let embedContent = response3.content;
                    response3.delete();
                    settings.edit(localization.TYPE_A_NAME);
                    const collector4 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 120000 });
                    collector4.on('collect', async response4 => {
                        if(response4.content == '0')
                        {
                          response4.delete();
                          message.delete();
                          settings.delete();
                          collector4.stop();
                        }
                        else
                        {
                          collector4.stop();
                          let embedName = response4.content;
                          response4.delete();
                          const newEmbed = new Discord.MessageEmbed()
                            .setColor(embedColor)
                            .setAuthor(embedTitle, message.guild.iconURL())
                            .setDescription(embedContent);
                          settings.delete();
                          const embedValidation = await message.reply(`${localization.WISH_CREATE_EMBED}\n\n`, newEmbed);
                          await embedValidation.react(emojis.accept);
                          await embedValidation.react(emojis.deny);

                          const filter = (reaction, user) => {
                            return [emojis.accept, emojis.deny].includes(reaction.emoji.id) && user.id == message.author.id;
                          };

                          const reactionCollector = embedValidation.createReactionCollector(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                          });

                          reactionCollector.on('collect', async (reaction, user) => {
                            if(user.id != message.author.id) return;
                            //const reaction = collected.first();

                            if(reaction.emoji.id === emojis.accept)
                            {
                              embedValidation.reactions.removeAll();

                              const newEmbed = await Embeds.create({
                                guild_id: message.guild.id,
                                name: embedName,
                                color: embedColor,
                                title: embedTitle,
                                content: embedContent
                              });

                              message.delete();

                              embedValidation.edit(localization.EMBED_CREATED + ' (ID:' + newEmbed.id + ')');
                            }
                            else if(reaction.emoji.id === emojis.deny)
                            {
                              embedValidation.reactions.removeAll();
                              message.delete();
                              embedValidation.edit(localization.EMBED_ABORTED);
                            }
                          });
                        }
                    });
                  }
              });
            }
        });
      }
  });
}
