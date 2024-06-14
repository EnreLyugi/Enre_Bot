const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emojis } = require('../../config.json');

// Configuração dos botões de música pausada
const pausedButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('unpauseButton')
        .setEmoji(emojis.play)
        .setStyle(ButtonStyle.Danger)
);
  
  // Configuração dos botões de música
const unpausedButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('rewindButton')
        .setEmoji(emojis.rewind)
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('pauseButton')
        .setEmoji(emojis.pause)
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('skipButton')
        .setEmoji(emojis.next)
        .setStyle(ButtonStyle.Success)
);

module.exports = { pausedButtons, unpausedButtons }