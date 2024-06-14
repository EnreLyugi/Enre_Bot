const { PermissionsBitField, AttachmentBuilder, ActivityType } = require('discord.js')
const { Guild_vars } = require("../../includes/tables.js");
const Canvas = require("canvas");

Font = Canvas.registerFont;
new Font("./fonts/edosz.ttf", { family: "edosz" });

const onGuildMemberAdd = async (client, member) => {
    const guild_vars = await Guild_vars.findAll({
      where: {
        guild_id: member.guild.id,
      },
    });
  
    if (!guild_vars[0]) return;
  
    if (guild_vars[0].join_role != null) {
      member.roles.add(guild_vars[0].join_role).catch((e) => {});
    }
  
    if (guild_vars[0].welcome_chat != null) {
      if (!member.guild.channels.resolve(guild_vars[0].welcome_chat)) return;
      if (
        !member.guild.members.me
          .permissionsIn(
            member.guild.channels.resolve(guild_vars[0].welcome_chat)
          )
          .has(PermissionsBitField.Flags.SendMessages)
      )
        return;
  
      let welcomeChat = guild_vars[0].welcome_chat;
      const channel = member.guild.channels.resolve(welcomeChat);
      if (!channel) return;
  
      //First Template
      const canvas = Canvas.createCanvas(700, 250);
      const ctx = canvas.getContext("2d");
      ctx.font = await applyText(
        canvas,
        member.displayName,
        60,
        canvas.width / 1.5
      );
  
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(70, 12);
      ctx.lineTo(70, 12);
      ctx.lineTo(40, 32);
      ctx.lineTo(40, canvas.height - 50);
      ctx.lineTo(60, canvas.height - 20);
      ctx.lineTo(canvas.height + 28, canvas.height - 20);
      ctx.lineTo(canvas.height + 28, 12);
      ctx.closePath();
      ctx.clip();
      const avatar = await Canvas.loadImage(
        client.users.resolve(member.id).displayAvatarURL({ extension: "png" })
      );
      ctx.drawImage(avatar, 40, 12, canvas.height - 28, canvas.height - 30);
      ctx.restore();
  
      const background = await Canvas.loadImage("./img/welcome/welcome.png");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
      ctx.textAlign = "center";
      ctx.rotate(0.32);
      ctx.textBaseline = "center";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 15;
      ctx.fillText(member.displayName, 490, 10);
  
      //Second Template
      /*const canvas = Canvas.createCanvas(1400, 800);
          const ctx = canvas.getContext('2d');
  
          const avatar = await Canvas.loadImage(client.users.resolve(member.id).displayAvatarURL({format: 'png'}));
          ctx.drawImage(avatar, 0, 0, 800, canvas.height);
  
          const frame = await Canvas.loadImage('./img/welcome/welcome2.png');
          ctx.drawImage(frame, 0, 0, 1400, canvas.height);
  
          var adventure = await new Font('./fonts/Adventure.otf', { family: 'Voice' });
  
          ctx.font = applyText(canvas, member.displayName, 70, canvas.width/2);
          ctx.textAlign = 'center';
          ctx.rotate(-0.07);
          ctx.textBaseline = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = "#000000";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 15;
          ctx.fillText(member.displayName, 375, 320);*/
  
      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome.png" });
  
      channel
        .send({ content: `${member}`, files: [attachment] })
        .catch((e) => {});
  
      client.user.setActivity(`in ${client.guilds.cache.size} Servers`, {
        type: ActivityType.Playing,
      });
    }
}

const applyText = (canvas, text, size, maxW) => {
  const ctx = canvas.getContext("2d");

  let fontSize = size;

  do {
    ctx.font = `${(fontSize -= 5)}px edosz`;
  } while (ctx.measureText(text).width > maxW - 100);
  return ctx.font;
};

module.exports = onGuildMemberAdd;