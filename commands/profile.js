const Discord = require("discord.js");
const Canvas = require("canvas");
const { Op } = require("sequelize");
const { registerUser } = require("../includes/functions.js");
const { Users, Users_level, Xp_roles } = require("../includes/tables.js");

exports.run = async (
  client,
  prefix,
  localization,
  message,
  args,
  con,
  defcolor
) => {
  if (
    !message.guild.me
      .permissionsIn(message.channel)
      .has(Discord.Permissions.FLAGS.ATTACH_FILES)
  )
    return message.reply(localization.REQUIRE_CLIENT_ATTACH_FILES_PERMISSION);

  let user =
    message.mentions.users.first() ||
    client.users.resolve(args[0]) ||
    message.author;

  if (!user) return message.reply(localization.USER_DONT_EXISTS);

  let member = message.guild.members.resolve(user.id);
  let guild = message.guild;

  let xp = 0;
  let level = 0;
  let ficha_comum = 0;
  let ficha_rara = 0;
  let rep = 0;
  let status = "";

  const userData = await Users.findAll({
    where: {
      user_id: user.id,
    },
  });

  const userLevel = await Users_level.findAll({
    where: {
      user_id: user.id,
      guild_id: guild.id,
    },
  });

  xp = userLevel[0].xp;
  level = userLevel[0].level;
  ficha_comum = userData[0].ficha_comum;
  ficha_rara = userData[0].ficha_rara;
  rep = userData[0].rep;
  if (userData[0].status != null) {
    status = userData[0].status;
  }

  const next_level = await Xp_roles.findAll({
    where: {
      xp: {
        [Op.gt]: xp,
      },
      guild_id: guild.id,
    },
    order: [["xp", "ASC"]],
    limit: 1,
  });

  if (next_level[0]) {
    let nextLevel = next_level[0].level;
    let nextLevelXP = next_level[0].xp;
    let lastLevel = 0;
    let lastLevelXP = 0;

    const last_level = Xp_roles.findAll({
      where: {
        xp: {
          [Op.lte]: xp,
        },
        guild_id: guild.id,
      },
      order: [["xp", "DESC"]],
      limit: 1,
    });

    if (last_level[0]) {
      lastLevel = last_level[0].level;
      lastLevelXP = last_level[0].xp;
    }

    let xpGap = nextLevelXP - lastLevelXP;
    let levelGap = nextLevel - lastLevel;

    let midGap = xpGap / levelGap;

    let curXP = lastLevelXP;
    let counter = 0;

    while (curXP < xp) {
      curXP += midGap;
      counter++;
    }
    level = lastLevel + counter - 1;

    if (level < 0) {
      level = 0;
    }
  }

  const canvas = Canvas.createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  const bg = await Canvas.loadImage("./img/profile/background.png");
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  const avatarSize = 180;
  const avatarWCenter = canvas.width / 2 - avatarSize / 2 + 5 + avatarSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(avatarWCenter, 15);
  ctx.lineTo(avatarWCenter, 15);
  ctx.lineTo(avatarWCenter + 90, 50 + 20);
  ctx.lineTo(avatarWCenter + 90, 148 + 15);
  ctx.lineTo(avatarWCenter, 198 + 15);
  ctx.lineTo(avatarWCenter, 198 + 15);
  ctx.lineTo(avatarWCenter - 99, 148 + 15);
  ctx.lineTo(avatarWCenter - 99, 50 + 20);
  ctx.closePath();
  ctx.clip();
  const avatar = await Canvas.loadImage(
    user.displayAvatarURL({ format: "png" })
  );
  ctx.drawImage(
    avatar,
    avatarWCenter - avatarSize / 2,
    15,
    avatarSize,
    avatarSize + 20
  );
  ctx.restore();

  const slot1 = {
    x: 0,
    y: 0,
    w: 20,
    h: 20,
  };

  const frame = await Canvas.loadImage("./img/profile/frame.png");
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "center";
  ctx.fillStyle = "#fcba03";
  /*ctx.shadowColor = "#a834eb";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 5;*/

  ctx.font = await applyText(canvas, member.displayName, 70);
  ctx.fillText(member.displayName, canvas.width / 2, 290);

  ctx.font = await applyText(canvas, rep, 50);
  ctx.fillText(rep, 55, 130);

  ctx.font = await applyText(canvas, level, 50);
  ctx.fillText(level, canvas.width - 55, 130);

  ctx.textAlign = "left";
  ctx.textBaseline = "left";
  ctx.font = await applyText(canvas, ficha_comum, 60);
  ctx.fillText(ficha_comum, 220, 400);

  ctx.font = await applyText(canvas, ficha_rara, 60);
  ctx.fillText(ficha_rara, 220, 535);

  ctx.lineWidth = 10;
  ctx.font = "20px edosz";
  ctx.lineBreak = "auto";
  ctx.allowNewLine = true;
  wrapText(ctx, status, 490, 370, 200, 20);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "profile.png"
  );

  message.channel.send({ files: [attachment] }).catch((e) => {
    message.reply(localization.ERROR_SENDING_MESSAGE);
  });
};

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(" ");
  var line = "";

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + " ";
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

const applyText = (canvas, text, size) => {
  const ctx = canvas.getContext("2d");

  let fontSize = size;

  do {
    ctx.font = `${(fontSize -= 5)}px edosz`;
  } while (ctx.measureText(text).width > canvas.width - 300);
  return ctx.font;
};
