const onGuildDelete = async (client, guild) => {
    if (!guild.name) return;
    client.guilds.cache
      .get("1249736903691997275")
      .channels.resolve("1249913101134860299")
      .send(`Fui removido do servidor ${guild.name} (${guild.id})`);
  
    client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
      type: "PLAYING",
    });
}

module.exports = onGuildDelete;