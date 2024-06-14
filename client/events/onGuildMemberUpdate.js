const { Vip_role, Users } = require("../../includes/tables.js");

const onGuildMemberUpdate = async (oldMember, newMember) => {
    const vipRole = await Vip_role.findAll({
      where: {
        guild_id: newMember.guild.id,
      },
    });
  
    if (vipRole[0]) {
      if (newMember.roles.resolve(vipRole[0].role_id)) {
        await Users.update(
          { vip: true },
          {
            where: {
              user_id: newMember.id,
            },
          }
        );
      } else {
        await Users.update(
          { vip: false },
          {
            where: {
              user_id: newMember.id,
            },
          }
        );
      }
    }
}

module.exports = onGuildMemberUpdate;