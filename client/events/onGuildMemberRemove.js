const { ActivityType } = require('discord.js');

const onGuildMemberRemove = async (client, member) => {
    client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
      type: ActivityType.Playing,
    });
}

module.exports = onGuildMemberRemove;