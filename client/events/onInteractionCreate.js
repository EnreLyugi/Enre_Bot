const { EmbedBuilder } = require('discord.js');
const { progressBar } = require("../../config.json");
const { buttons } = require("../components/");

const onInteractionCreate = async (client, interaction) => {
    if(interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    }
  
    if (!interaction.isButton()) return;
  
    if (interaction.customId == "back" || interaction.customId == "forward")
      return;
    
    let guildQueue = await client?.player.getQueue(interaction.message.guild.id);
    if (!guildQueue) return interaction.message.delete().catch((e) => {});
    if (!guildQueue.nowPlaying) return;
  
    const localization =
      await require(`../../localization/${guildQueue.data.language}.json`);
  
    if (interaction.message.id != guildQueue.nowPlaying.embed.id) {
      interaction.message.delete().catch((e) => {});
      return;
    }
  
    if (interaction.guild.members.me.voice.channel != interaction.member.voice.channel)
      return;
  
    if( interaction.customId == "rewindButton") {
      guildQueue.seek(100);
  
      await interaction.update({ components: [buttons.unpausedButtons] });
    }
  
    if (interaction.customId == "pauseButton") {
      await guildQueue.setPaused(true);
  
      const ProgressBar = await guildQueue.createProgressBar({
        size: progressBar.size,
        block: progressBar.block,
        arrow: progressBar.arrow,
      });
  
      let embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setAuthor({ name: localization.SONG_PAUSED })
        .setThumbnail(guildQueue.nowPlaying.thumbnail)
        .setDescription(
          `[${guildQueue.nowPlaying.name}](${
            guildQueue.nowPlaying.url
          })\n${ProgressBar.bar.replaceAll(
            " ",
            progressBar.space
          )}\n                     ${ProgressBar.times}\n\n${
            localization.REQUESTED_BY
          } ${guildQueue.nowPlaying.requestedBy}`
        )
        .addFields([
          {
            name: `\u200B`,
            value: `[Invite me](https://discord.com/api/oauth2/authorize?client_id=1249736797056143400&permissions=8&scope=bot)`
          }
        ]);
      guildQueue.nowPlaying.embed.edit({ embeds: [embed] }).catch((e) => {});
  
      await interaction.update({ embeds: [embed], components: [buttons.pausedButtons] });
    }
  
    if (interaction.customId == "unpauseButton") {
      guildQueue.setPaused(false);
  
      await interaction.update({ components: [buttons.unpausedButtons] });
    }
  
    if (interaction.customId == "skipButton") {
      guildQueue.skip();
    }
};

module.exports = onInteractionCreate;