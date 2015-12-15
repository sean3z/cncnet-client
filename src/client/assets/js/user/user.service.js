angular.module('app').service('UserSvc', UserSvc);

UserSvc.$inject = ['$q', 'SocketSvc'];
function UserSvc($q, SocketSvc) {
    var service = this;
    var socket = SocketSvc.connection;

    service.user = {};
    service.whoami = whoami;

    socket.on('whoami', function(data) {
        service.user = data;
    });

    socket.on('connect', whoami);
    socket.on('disconnect', function () {
        // should probably do something here
    });

    return service;

    function whoami() {
        return $q(function(resolve) {
            if (service.user.nick && service.user.channel) {
                return resolve(service.user);
            }

            socket.emit('*', {
                event: 'whoami'
            });

            socket.on('whoami', response);

            function response(data) {
                service.user = data;
                socket.removeListener('whoami', response);
                resolve(data);
            }
        });
    }
}