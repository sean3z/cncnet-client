(function() {
    angular.module('app', [
        'ui.router',
        'ct.ui.router.extras.sticky',
        'ui.bootstrap',
        'Socket'
    ]);

    angular.module('app').run(configuration);

    configuration.$inject = ['SocketSvc'];
    function configuration(SocketSvc) {
        SocketSvc.connect();
        var socket = SocketSvc.connection;
        var loading = document.getElementById('loading');

        // no wildcard support for events
        // https://github.com/socketio/socket.io/issues/434
        socket.on('topic', ready);
        socket.on('names', ready);
        socket.on('privmsg', ready);
        socket.on('quit', ready);
        socket.on('join', ready);
        socket.on('part', ready);
        socket.on('server', ready);

        // app is ready
        function ready(data) {
            console.log(data);
            loading.style.display = 'none';
        }
    }
})();
