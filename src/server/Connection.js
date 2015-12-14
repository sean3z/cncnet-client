var net = require('net');
var debug = require('debug')('cncnet');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Connection(options) {
    if (!options) {
        throw new Error('missing options');
    }

    this.options = options;
    this.connect();
}

util.inherits(Connection, EventEmitter);

Connection.prototype.connect = function() {
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

Connection.prototype.send = function(message) {
    if (this.socket) {
        this.socket.write(message +'\r\n');
        debug('out: %s', message);
    }
};

Connection.prototype.join = function(opts) {
    if (!opts.destination) return;
    opts.password = opts.password || '';
    this.send(['JOIN', opts.destination, opts.password].join(' '));
};

Connection.prototype.list = function() {
    this.send('LIST');
};

Connection.prototype.part = function(opts) {
    if (!opts.destination) return;
    this.send(['PART', opts.destination].join(' '));
};

Connection.prototype.privmsg = function(opts) {
    if (!opts.destination || !opts.message) return;
    this.send(['PRIVMSG', opts.destination, ':'+ opts.message].join(' '));
};

Connection.prototype.action = function(opts) {
    if (!opts.destination || !opts.message) return;

    this.privmsg({
        destination: opts.destination,
        message: String.fromCharCode(1) + 'ACTION' + opts.message + String.fromCharCode(1)
    });
};

Connection.prototype.delegate = function(buffer) {
    debug('in: %s', buffer.join(' '));

    if (buffer[0] == 'PING') {
        this.send('PONG '+ buffer[1]);
    } else if (typeof buffer[1] != undefined) {
        var data;
        switch(buffer[1]) {
            case '001':
                this.join({
                    destination: this.options.lobby
                });
            break;

            case '332':
                data = {
                    event: 'topic',
                    destination: buffer[3],
                    message: buffer.slice(4).join(' ').substring(1)
                };

                this.emit('*', data);
            break;

            case '353':
                data = {
                    event: 'names',
                    destination: buffer[4],
                    message: irc.names(buffer.slice(5).join(' ').substring(1))
                };

                this.emit('*', data);
            break;

            case 'PRIVMSG':
                data = {
                    event: 'privmsg',
                    originator: irc.nick(buffer[0]),
                    destination: buffer[2],
                    message: buffer.slice(3).join(' ').substring(1)
                };

                if (data.destination.indexOf('#') < 0) {
                    data.destination = irc.nick(data.destination);
                }

                this.emit('*', data);
            break;

            case 'QUIT':
                data = {
                    event: 'quit',
                    originator: irc.nick(buffer[0]),
                    message: buffer.slice(2).join(' ').substring(1)
                };

                this.emit('*', data);
            break;

            case 'JOIN':
            case 'PART':
                data = {
                    event: buffer[1].toLowerCase(),
                    originator: irc.nick(buffer[0]),
                    destination: buffer[2]
                };

                this.emit('*', data);
            break;
        }
    }
};

var irc = {
    nick: function(string) {
        return string.replace(/:|!.*/g, '');
    },
    names: function(string) {
        string = string.replace(/,\d+,\d+/g, '').split(' ');
        for(var i = 0; i < string.length; i++) {
            string[i] = irc.nick(string[i]);
        }
        return string;
    }
};

module.exports = Connection;
