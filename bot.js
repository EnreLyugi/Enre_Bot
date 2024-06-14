const { Client, GatewayIntentBits } = require("discord.js");
const sequelize = require("./includes/db.js");
const {
  onReady,
  onMessageCreate,
  onGuildCreate,
  onGuildDelete,
  onGuildMemberRemove,
  onGuildMemberAdd,
  onRoleDelete,
  onChannelCreate,
  onGuildMemberUpdate,
  onVoiceStateUpdate,
  onMessageDelete,
  onMessageDeleteBulk,
  onInteractionCreate,
  onError
} = require("./client/events/");
const {
  onSongAdd,
  onPlaylistAdd,
  onQueueEnd,
  onSongChanged,
  onSongFirst,
  onClientDisconnect,
  onPlayerError
} = require("./client/player/events/");
require("dotenv").config();

//Discord Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent
  ],
});

//Load music player
const { Player } = require("@jadestudios/discord-music-player");
const player = new Player(client, {
  leaveOnEmpty: true,
  leaveOnStop: true,
  leaveOnEnd: true
});
client.player = player; //Set the player into client

//client events
client
.on("ready", () => onReady(client)) //bot gets online
.on("messageCreate", (message) => onMessageCreate(client, sequelize, message)) //bot receives a Message
.on("guildCreate", (guild) => onGuildCreate(client, guild)) //bot joins a Guild
.on("guildDelete", (guild) => onGuildDelete(client, guild)) //bot is removed from a Guild
.on("guildMemberRemove", (member) => onGuildMemberRemove(client, member)) //someone quit or is removed from a guild
.on("guildMemberAdd", (member) => onGuildMemberAdd(client, member)) //someone joins a guild
.on("roleDelete", (role) => onRoleDelete(role)) //a role is deleted
.on("channelCreate", (channel) => onChannelCreate(channel)) //a channel is created
.on("guildMemberUpdate", (oldMember, newMember) => onGuildMemberUpdate(oldMember, newMember)) //a member data is update
.on("voiceStateUpdate", (oldState, newState) => onVoiceStateUpdate(client, oldState, newState)) //someone's voice state changes
.on("messageDelete", (message) => onMessageDelete(client, message)) //a message is deleted
.on("messageDeleteBulk", (messages) => onMessageDeleteBulk(client, messages)) //a bulk of messages is deleted
.on("interactionCreate", (interaction) => onInteractionCreate(client, interaction)) //a interaction is created with the bot
.on("error", (e) => onError(client, e));

//music player events
client.player
.on("songAdd", onSongAdd) //Song is added to Queue
.on("playlistAdd", onPlaylistAdd) //Playlist is added to Queue
.on("queueEnd", onQueueEnd) //Queue ends
.on("songChanged", onSongChanged) //Song Changed
.on("songFirst", onSongFirst) //First song starts
.on("clientDisconnect", onClientDisconnect) //Client Disconnects
.on("error", onPlayerError);

console.log(`\x1b[32m%s\x1b[0m`, "Bot desenvolvido por: Enre Lyugi");

(async () => {
  //authenticate sequelize connection to DB
  await sequelize
    .authenticate()
    .then(() => {
        console.log(`\x1b[32m%s\x1b[0m`, `Conectado ao banco de dados!`);
    })
    .catch((err) => {
        console.log(
        `\x1b[31m%s\x1b[0m`,
        `Falha ao se conectar ao banco de dados!`
        );
        console.log(`\x1b[31m%s\x1b[0m`, err);
        process.exit(); //Close program if DB connection failed
    });

  //Sync DB tables with tables.js
  await sequelize
    .sync()
    .then(() => {
        console.log(`\x1b[32m%s\x1b[0m`, `Tabelas sincronizadas!`);
        client.login(process.env.TOKEN);
    })
    .catch((err) => {
        console.log(`\x1b[31m%s\x1b[0m`, err);
    });
  
})();

process.on("SIGINT", ()  => {
  console.log(`\x1b[32m%s\x1b[0m`, "\nAplicação desligada com CTRL+C");
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
  client.guilds.cache
    .get('1249736903691997275')
    .channels.resolve('1249778314239938590')
    .send(`Ocorreu um erro não tratado na aplicação:\n\`${err}\``)
    .catch(console.error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Promessa rejeitada sem tratamento:', reason);
  client.guilds.cache
    .get('1249736903691997275')
    .channels.resolve('1249778314239938590')
    .send(`Ocorreu uma promessa rejeitada sem tratamento na aplicação:\n\`${reason}\``)
    .catch(console.error);
});