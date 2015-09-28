var Relay = require('./Relay');
var debug = require('debug')('xwisadmin');
var http = require('http');

module.exports = websocket;

function websocket(options) {
    var server = http.createServer(function(request, response) {});
    var io = require('socket.io')(server);
    server.listen(4008);

    var bot = new Relay({
       nick: 'tahj_',
       host: 'irc.freenode.net',
       lobby: '#cncnet'
    });

    bot.on('*', function(data) {
        io.emit(data.event, data)
    });
}
