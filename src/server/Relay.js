var net = require('net');
var debug = require('debug')('cncnet');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Relay(options) {
    if (!options) {
        throw new Error('missing options');
    }

    this.options = options;
    this.channels = {};

    this.connect();
}

util.inherits(Relay, EventEmitter);

Relay.prototype.connect = function() {
    var self = this;
    this.socket = net.connect({
        port: this.options.port || 6667,
        host: this.options.host || 'irc.freenode.net'
    });

    this.socket.on('connect', function() {
        var message = [
            'NICK '+ self.options.nick,
            ['USER', self.options.nick, self.options.host, self.options.nick, ':'+ self.options.nick].join(' ')
        ];

        self.send(message.join('\r\n'));
    });

    this.socket.on('data', function(data) {
        data = data.toString().split('\r\n');
        for(var key in data) {
            self.delegate(data[key].split(' '));
        }
    });

    this.socket.on('close', function(error) {
        if (error) self.connect();
    });
};

Relay.prototype.send = function(message) {
    if (this.socket) {
        this.socket.write(message +'\r\n');
        debug('out: %s', message);
    }
};

Relay.prototype.join = function(channel, password) {
    password = password || '';
    this.send(['JOIN', channel, password].join(' '));
};

Relay.prototype.list = function() {
    this.send('LIST');
};

Relay.prototype.part = function(channel) {
    this.send(['PART', channel].join(' '));
};

Relay.prototype.privmsg = function(destination, message) {
    this.send(['PRIVMSG', destination, ':'+ message].join(' '));
};

Relay.prototype.page = function(destination, message) {
    this.send(['PAGE', destination, ':'+ message].join(' '));
};

Relay.prototype.action = function(destination, message) {
    this.privmsg(destination, String.fromCharCode(1) + 'ACTION' + message + String.fromCharCode(1));
};

Relay.prototype.delegate = function(buffer) {
    debug('in: %s', buffer.join(' '));

    if (buffer[0] == 'PING') {
        this.send('PONG '+ buffer[1]);
    } else if (typeof buffer[1] != undefined) {
        switch(buffer[1]) {
            case '001':
                this.join(this.options.lobby);
            break;

            case '353':
                var names = irc.names(buffer.slice(5).join(' ').substring(1));
                this.channels[buffer[4]] = (this.channels[buffer[4]] || []).concat(names);
            break;

            case 'PRIVMSG':
                var data = {
                    event: 'privmsg',
                    originator: irc.nick(buffer[0]),
                    destination: buffer[2],
                    message: buffer.slice(3).join(' ').substring(1)
                };

                debug('PRIVMSG data', data);

                if (data.destination.indexOf('#') < 0) {
                    data.destination = irc.nick(data.destination);
                }

                this.emit('*', data);
            break;

            case 'JOIN':
                var data = {
                    event: 'join',
                    originator: irc.nick(buffer[0]),
                    destination: buffer[2]
                };

                debug('JOIN data', data);

                if (data.originator != this.options.nick.toLowerCase()) {
                    if (this.channels[data.destination] && this.channels[data.destination].indexOf(data.originator) < 0) {
                        this.channels[data.destination].push(data.originator);
                    }
                } else {
                    this.channels[data.destination] = [];
                }

                this.emit('*', data);
            break;

            case 'PART':
                var data = {
                    event: 'part',
                    originator: irc.nick(buffer[0]),
                    destination: buffer[2]
                };

                debug('PART data', data);

                if (data.originator != this.options.nick.toLowerCase()) {
                    var i = this.channels[data.destination].indexOf(data.originator);
                    if (i >= 0) this.channels[data.destination].splice(i, 1);
                } else {
                    delete this.channels[data.destination];
                }

                this.emit('*', data);
            break;
        }
    }
};

var irc = {
    nick: function(string) {
        return string.replace(/:|!.*/g, '').toLowerCase();
    },
    names: function(string) {
        string = string.replace(/,\d+,\d+/g, '').split(' ');
        for(var i = 0; i < string.length; i++) {
            string[i] = irc.nick(string[i]);
        }
        return string;
    }
};

module.exports = Relay;
