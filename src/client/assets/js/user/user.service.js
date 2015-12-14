angular.module('app').service('UserSvc', UserSvc);

UserSvc.$inject = ['SocketSvc'];
function UserSvc(SocketSvc) {
    var service = this;
    var socket = SocketSvc.connection;

    service.user = {};

    socket.on('connect', function () {
        socket.emit('*', {
            event: 'whoami'
        });
    });

    socket.on('whoami', function(data) {
        service.user = data;
    });

    socket.on('disconnect', function () {
        // should probably do something here
    });

    return service.user;
}