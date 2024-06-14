const { Op } = require("sequelize");
const { Xp_channels, Users, Users_level, Level_rewards, Xp_roles } = require("../../includes/tables.js");
const { registerUser } = require("../../includes/functions.js");
const cooldown = require('../../includes/cooldown.js');

const voiceStateUpdate = async (client, oldState, newState) => {
    if (client.users.resolve(newState.member.id).bot) return;
  
    if (!newState.channel) return;
  
    if (newState.channelId != oldState.channelId) {
      const xp_channel = await Xp_channels.findAll({
        where: {
          guild_id: newState.guild.id,
          channel_id: newState.channelId,
        },
      });
  
      if (!xp_channel[0]) return;
    }
  
    if (newState.member.voice.channel) {
      checkVoice(newState);
    }
}

async function checkVoice(newState) {
    try {
      if (newState.member) {
        if (!newState.channel) {
          return;
        } else {
          let membersCounter = 0;
          newState.channel.members.forEach(function (actualMember) {
            if (
              !client.users.resolve(actualMember.id).bot &&
              !actualMember.voice.mute &&
              !actualMember.voice.deaf
            ) {
              membersCounter++;
            }
          });
  
          if (membersCounter > 1 && !newState.mute && !newState.deaf) {
            await registerUser(newState.member.user, newState.guild);
            const xp_channel = await Xp_channels.findAll({
              where: {
                guild_id: newState.guild.id,
                channel_id: newState.channelId,
              },
            });
  
            if (xp_channel[0]) {
              if (!cooldown.is("xp", newState.id)) {
                cooldown.add("xp", newState.id);
                let xpRate = 1;
                var today = new Date();
                if (today.getDay() == 6 || today.getDay() == 0) {
                  xpRate = 2;
                }
  
                let randXP = Math.floor((Math.random() * 5 + 1) * xpRate);
                await Users_level.update(
                  { xp: sequelize.literal(`xp + ${randXP}`) },
                  {
                    where: {
                      guild_id: newState.guild.id,
                      user_id: newState.id,
                    },
                  }
                );
  
                const userData = await Users.findAll({
                  where: {
                    user_id: newState.id,
                  },
                });
  
                let userLevel = await Users_level.findAll({
                  where: {
                    user_id: newState.id,
                    guild_id: newState.guild.id,
                  },
                });
  
                let xp = userLevel[0].xp + randXP;
                let level = parseInt(userLevel[0].level);
  
                const next_role = await Xp_roles.findAll({
                  where: {
                    guild_id: newState.guild.id,
                    level: {
                      [Op.gt]: userLevel[0].level,
                    },
                  },
                  order: [["level", "ASC"]],
                  limit: 1,
                });
  
                if (next_role[0]) {
                  if (next_role[0].xp <= xp) {
                    newState.member.roles
                      .add(next_role[0].role_id)
                      .catch((e) => {});
  
                    await Users_level.update(
                      { level: next_role[0].level },
                      {
                        where: {
                          guild_id: newState.guild.id,
                          user_id: newState.id,
                        },
                      }
                    );
  
                    const rewards = await Level_rewards.findAll({
                      where: {
                        level_id: next_role[0].role_id,
                      },
                    });
  
                    if (rewards[0]) {
                      rewards.forEach(async function (reward) {
                        if (reward.reward_type == "fb") {
                          await Users.update(
                            {
                              ficha_comum: sequelize.literal(
                                `ficha_comum + ${reward.value}`
                              ),
                            },
                            {
                              where: {
                                user_id: newState.id,
                              },
                            }
                          );
                        } else if (reward.reward_type == "fr") {
                          await Users.update(
                            {
                              ficha_rara: sequelize.literal(
                                `ficha_rara + ${reward.value}`
                              ),
                            },
                            {
                              where: {
                                user_id: newState.id,
                              },
                            }
                          );
                        } else if (reward.reward_type == "role") {
                          newState.member.roles
                            .add(reward.value)
                            .catch((e) => {});
                        } else if (reward.reward_type == "colorfree") {
                          await Users_level.update(
                            { colorfree: 1 },
                            {
                              where: {
                                guild_id: newState.guild.id,
                                user_id: newState.id,
                              },
                            }
                          );
                        }
                      });
                    }
                  }
                } else {
                  //SELECT FROM Xp_roles WHERE guild_id = newState.guild.id AND xp <= xp ORDER BY xp DESC LIMIT 1
                  const lastrole = await Xp_roles.findAll({
                    where: {
                      guild_id: newState.guild.id,
                      xp: {
                        [Op.lte]: xp,
                      },
                    },
                    order: [["xp", "DESC"]],
                    limit: 1,
                  });
                }
  
                //Timeout to remove user from XP cooldown
                setTimeout(() => {
                  cooldown.remove("xp", newState.id);
                }, 1000 * 60);
              }
  
              if (!cooldown.is("ficha", newState.id)) {
                cooldown.add("ficha", newState.id);
  
                await Users.update(
                  { ficha_comum: sequelize.literal(`ficha_comum+1`) },
                  {
                    where: {
                      user_id: newState.id,
                    },
                  }
                );
  
                setTimeout(() => {
                  cooldown.remove("ficha", newState.id);
                }, 1000 * 60 * 5);
              }
            }
          }
        }
        setTimeout(() => {
          checkVoice(newState);
        }, 1000);
      }
    } catch (e) {}
}

module.exports = voiceStateUpdate;