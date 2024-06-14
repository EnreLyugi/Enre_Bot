const onClientDisconnect = require("./onClientDisconnect");
const onError = require("./onPlayerError");
const onPlaylistAdd = require("./onPlaylistAdd");
const onQueueEnd = require("./onQueueEnd");
const onSongAdd = require("./onSongAdd");
const onSongChanged = require("./onSongChanged");
const onSongFirst = require("./onSongFirst");
const onPlayerError = require('./onPlayerError')

module.exports = {
    onSongAdd,
    onPlaylistAdd,
    onQueueEnd,
    onSongChanged,
    onSongFirst,
    onClientDisconnect,
    onPlayerError
};