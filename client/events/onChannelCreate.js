const { Guild_vars } = require("../../includes/tables.js");

const onChannelCreate = async (channel) => {
    if (channel.guild) {
      const guild_vars = await Guild_vars.findAll({
        where: {
          guild_id: channel.guild.id,
        },
      });
  
      if (guild_vars[0]) {
        if (guild_vars[0].muted_role) {
          channel.permissionOverwrites
            .create(channel.guild.roles.resolve(guild_vars[0].muted_role), {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false,
              SPEAK: false,
            })
            .catch((e) => {});
        }
      }
    }
}

module.exports = onChannelCreate;