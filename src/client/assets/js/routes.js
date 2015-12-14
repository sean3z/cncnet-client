(function() {
    angular.module('app').config(configuration);

    configuration.$inject = ['$stateProvider', '$urlRouterProvider'];
    function configuration($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('lobby', {
                url: '/lobby',
                controller: 'LobbyCtrl',
                controllerAs: 'lobbyCtrlVM',
                templateUrl: 'assets/js/lobby/lobby.html'
            })

            .state('settings', {
                url: '/settings',
                controller: 'SettingsCtrl',
                controllerAs: 'settingsCtrlVM',
                templateUrl: 'assets/js/settings/settings.html'
            });

        $urlRouterProvider.otherwise('/lobby');
    }
})();