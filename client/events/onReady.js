const checkStreams = require('../../twitch/')

const onReady = async (client) => {
    console.log(
        `\x1b[34m%s\x1b[0m`,
        `\nBot iniciado!\n\nUsers: ${client.users.cache.size} \nServidores: ${client.guilds.cache.size}\n`
    );

    let serverList = '';

    client.guilds.cache.forEach(guild => {
        serverList += guild.name + '\n';
    });

    client.guilds.cache
        .get("1249736903691997275")
        .channels.resolve("1249779514477907989")
        .send(`\nBot iniciado!\n\nUsers: ${client.users.cache.size} \nServidores: ${client.guilds.cache.size}\n\n${serverList}\n`);

    client.user.setPresence({ activities: [{ name: `in ${client.guilds.cache.size} Servers` }], status: 'invisible' });

    require("../../rest.js");
    //require("../../express/");
    //setInterval(() => checkStreams(client), 5000);
}

module.exports = onReady