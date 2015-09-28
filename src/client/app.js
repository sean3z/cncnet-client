var socket = io.connect('http://localhost:4008');
var channels = {};

socket.on('connect', function () {
    socket.emit('whoami');
});

socket.on('disconnect', function () {

});

socket.on('channels', function(data) {
    console.log('channels', data);
});

socket.on('part', function(data) {
    console.log('part', data);
});

socket.on('join', function(data) {
    console.log('join', data);
});

socket.on('privmsg', function(data) {
    console.log('privmsg', data);
});
