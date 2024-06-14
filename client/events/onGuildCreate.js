const onGuildCreate = async (client, guild) => {
    client.guilds.cache
      .get("1249736903691997275")
      .channels.resolve("1249913101134860299")
      .send(`Fui adicionado ao servidor ${guild.name} (${guild.id})`);
  
    client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
      type: "PLAYING",
    });
}

module.exports = onGuildCreate;