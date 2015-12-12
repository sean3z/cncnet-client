var socket = io.connect('http://localhost:4008');
var channels = {};

socket.on('connect', function () {
    socket.emit('whoami');
});

socket.on('disconnect', function () {

});

socket.on('title', function(data) {
    console.log(data);
});

socket.on('names', function(data) {
    console.log(data);
});

socket.on('quit', function(data) {
    console.log(data);
});

socket.on('part', function(data) {
    console.log(data);
});

socket.on('join', function(data) {
    console.log(data);
});

socket.on('privmsg', function(data) {
    console.log(data);
});
