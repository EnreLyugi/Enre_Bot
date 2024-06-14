const onError = (client, err) => {
    console.log(`\x1b[31m%s\x1b[0m`, err);
    client.guilds.cache
      .get("1249736903691997275")
      .channels.resolve("1249778314239938590")
      .send(err.message);
};

module.exports = onError;