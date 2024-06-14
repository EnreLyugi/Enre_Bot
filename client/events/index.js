const onReady = require('./onReady');
const onMessageCreate = require('./onMessageCreate');
const onGuildCreate = require('./onGuildCreate');
const onGuildDelete = require('./onGuildDelete');
const onGuildMemberRemove = require('./onGuildMemberRemove');
const onGuildMemberAdd = require('./onGuildMemberAdd');
const onRoleDelete = require('./onRoleDelete');
const onChannelCreate = require('./onChannelCreate');
const onGuildMemberUpdate = require('./onGuildMemberUpdate');
const onVoiceStateUpdate = require('./onVoiceStateUpdate');
const onMessageDelete = require('./onMessageDelete');
const onMessageDeleteBulk = require('./onMessageDeleteBulk');
const onInteractionCreate = require('./onInteractionCreate');
const onError = require('./onError');

module.exports = {
    onReady,
    onMessageCreate,
    onGuildCreate,
    onGuildDelete,
    onGuildMemberRemove,
    onGuildMemberAdd,
    onRoleDelete,
    onChannelCreate,
    onGuildMemberUpdate,
    onVoiceStateUpdate,
    onMessageDelete,
    onMessageDeleteBulk,
    onInteractionCreate,
    onError
};