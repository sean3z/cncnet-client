angular.module('Socket', []).service('SocketSvc', SocketSvc);

SocketSvc.$inject = [];
function SocketSvc() {
    var service = this;

    service.connection;
    service.connect = connect;

    return service;

    function connect() {
        service.connection = io.connect('http://localhost:4008');
        return service.connection;
    }
}