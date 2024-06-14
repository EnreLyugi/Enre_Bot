const { Op } = require('sequelize');
const {
  Users_level
} = require('../includes/tables.js');

exports.run = async ({ message }) => {

    if(message.author.id != "dbcdfcvhbc") return;

    await Users_level.destroy({
        where: {
            xp: {
                [Op.lte]: 0
            }
        }
    });

}