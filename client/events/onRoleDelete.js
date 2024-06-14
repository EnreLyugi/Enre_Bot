const { Colors, Color_inventory } = require("../../includes/tables.js");

const onRoleDelete = async (role) => {
    try {
      const colors = await Colors.findAll({
        where: {
          role_id: role.id,
        },
      });
  
      if (colors[0]) {
        await Colors.destroy({
          where: {
            role_id: role.id,
          },
        });
        await Color_inventory.destroy({
          where: {
            role_id: role.id,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
}

module.exports = onRoleDelete;