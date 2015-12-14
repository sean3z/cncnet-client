(function() {
    angular.module('app', [
        'ui.router',
        'ct.ui.router.extras.sticky',
        'Socket'
    ]);

    angular.module('app').run(configuration);

    configuration.$inject = ['SocketSvc'];
    function configuration(SocketSvc) {
        SocketSvc.connect();
    }
})();
