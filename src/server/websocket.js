var Connection = require('./Connection');
var debug = require('debug')('cncnet');
var http = require('http');

module.exports = websocket;

function websocket(options) {
    var server = http.createServer(function(request, response) {});
    var io = require('socket.io')(server);
    server.listen(4008);

    var relay = new Connection({
       nick: options.nick,
       host: 'irc.gamesurge.net',
       lobby: '#cncnet',
       games: '#cncnet-games'
    });

    relay.on('*', function(data) {
        io.emit(data.event, data)
    });

    io.on('connect', function(socket) {
        socket.on('*', function(data) {
            switch (data.event) {
                case 'whoami':
                    io.emit(data.event, {
                        nick: options.nick,
                        lobby: '#cncnet'
                    });
                break;

                default:
                    relay[data.event] && relay[data.event](data);
            }
        });
    });
}
