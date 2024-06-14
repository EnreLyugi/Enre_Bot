exports.run = async ({ localization, message }) => {
  const m = await message.channel.send(localization.CALCULATING);
  m.edit(
    `${localization.PING}: **${
      m.createdTimestamp - message.createdTimestamp
    }**ms!`
  );
};
