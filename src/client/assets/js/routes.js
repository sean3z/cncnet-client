(function() {
    angular.module('app', [
        'ui.router'
    ]);

    angular.module('app').config(configuration);

    function configuration($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('lobby', {
                url: '/lobby',
                controller: 'LobbyCtrl',
                controllerAs: 'lobbyCtrlVM',
                templateUrl: 'assets/js/lobby/lobby.html'
            });

        $urlRouterProvider.otherwise('/lobby');
    }
})();