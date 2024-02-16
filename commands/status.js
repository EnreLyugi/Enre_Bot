const Discord = require('discord.js');
const {
  Users
} = require('../includes/tables.js');

exports.run = async (client, prefix, localization, message, args, sequelize) => {
  if(!args[0]) return message.channel.send(localization.usage.status.replace(`{{prefix}}`, prefix));

  let status = null;
  args.forEach(function(word) {
    if(word.length > 17)
    {
      let newWord = null;
      let lastBreakIndex = -2;
      for(let i=0; i < word.length; i++)
      {
        if(newWord == null)
        {
          newWord = word[i];
        }
        else
        {
          newWord = newWord + word[i];
        }

        if(i == lastBreakIndex+17)
        {
          newWord = newWord + '\n';
          lastBreakIndex = i-1;
        }
      }
      word = newWord;
    }

    if(status == null)
    {
      status = word;
    }
    else
    {
      status = status + ' ' + word;
    }
  });

  if(status.length > 150) return message.reply(localization.CHARACTER_LIMIT.replace(`{{value}}`, 150));
  status = status.replace(/"/g, '');

  await Users.update({ status: status }, {
    where: {
      user_id: message.author.id
    }
  });
  message.reply(localization.STATUS_CHANGED);
}
