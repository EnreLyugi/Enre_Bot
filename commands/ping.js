exports.run = async (client, prefix, localization, message, args) => {
  const m = await message.channel.send(localization.CALCULATING);
  m.edit(
    `${localization.PING}: **${
      m.createdTimestamp - message.createdTimestamp
    }**ms!`
  );
};
