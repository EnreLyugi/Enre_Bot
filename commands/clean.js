const Discord = require('discord.js');
const config = require('../config.json');
const { Op } = require('sequelize');
const {
  Users,
  Daily,
  Users_level
} = require('../includes/tables.js');

const emojis = config.emojis;

exports.run = async (client, prefix, localization, message, args, sequelize) => {

    if(message.author.id != "308028890213777418") return;

    await Users_level.destroy({
        where: {
            xp: {
                [Op.lte]: 0
            }
        }
    });

}