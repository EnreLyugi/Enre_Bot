const Discord = require('discord.js');
const Canvas = require('canvas');
const { Op } = require('sequelize');
const {
    Ships
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
    if(!message.guild.me.permissionsIn(message.channel).has(Discord.Permissions.FLAGS.ATTACH_FILES)) return message.reply(localization.REQUIRE_CLIENT_ATTACH_FILES_PERMISSION);

    let user1;
    let user2;
    let usageMessage = localization.usage.ship.replace(`{{prefix}}`, prefix);
    if(message.mentions.users.size == 2)
    {
        user1 = message.mentions.users.first();
        user2 = message.mentions.users.last();
    }
    else if (message.mentions.users.size == 1)
    {
        if(message.author.id == message.mentions.users.first().id) return message.reply(usageMessage);
        user1 = message.author;
        user2 = message.mentions.users.first();
    }
    else
    {
        return message.reply(usageMessage);
    }

    if(!user1 || !user2) return message.reply(localization.ONE_OF_USERS_DONT_EXISTS);

    const ship = await Ships.findAll({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        {user1: user1.id},
                        {user2: user2.id}
                    ]
                },
                {
                    [Op.and]: [
                        {user1: user2.id},
                        {user2: user1.id}
                    ]
                }
            ]
        }
    });

    let value;
    if(ship[0])
    {
        value = ship[0].value
    }
    else
    {
        value = Math.floor(Math.random() * 101);
        await Ships.create({
            user1: user1.id,
            user2: user2.id,
            value: value
        });
    }

    const canvas = Canvas.createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    const avatar1 = await Canvas.loadImage(user1.displayAvatarURL({format: 'png'}));
    ctx.drawImage(avatar1, 0, 0, canvas.width/2, canvas.height);

    const avatar2 = await Canvas.loadImage(user2.displayAvatarURL({format: 'png'}));
    ctx.drawImage(avatar2, canvas.width/2, 0, canvas.width/2, canvas.height);

    const heart = await Canvas.loadImage('./img/ship/heart.png');
    let heartSize = 200;
    ctx.drawImage(heart, canvas.width/2-heartSize/2, canvas.height/2-heartSize/2, heartSize, heartSize);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'center';
    ctx.fillStyle = '#ff94bf';
    ctx.font = `bold 40px serif`;
    ctx.fillText(`${value}%`, canvas.width/2, canvas.height/2);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'ship.png');
    message.channel.send({files: [attachment]});
};
