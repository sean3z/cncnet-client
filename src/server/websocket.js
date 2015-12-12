var Connection = require('./Connection');
var debug = require('debug')('cncnet');
var http = require('http');

module.exports = websocket;

function websocket(options) {
    var server = http.createServer(function(request, response) {});
    var io = require('socket.io')(server);
    server.listen(4008);

    var bot = new Connection({
       nick: options.nick,
       host: 'irc.gamesurge.net',
       lobby: '#cncnet'
    });

    bot.on('*', function(data) {
        io.emit(data.event, data)
    });
}
