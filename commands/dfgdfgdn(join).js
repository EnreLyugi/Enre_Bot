exports.run = async ({ client, message }) => {
  client.emit("guildMemberAdd", message.member);
}
