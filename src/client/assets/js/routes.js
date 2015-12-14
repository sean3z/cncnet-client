(function() {
    angular.module('app').config(configuration);

    configuration.$inject = ['$stateProvider', '$urlRouterProvider'];
    function configuration($stateProvider, $urlRouterProvider) {
        var states = [];

        states.push({
            name: 'app',
            url: '/app',
            templateUrl: 'assets/js/app.container.html',
            controllerAs: 'appVm',
            controller: function($state) {
                this.$state = $state;
            }
        });

        states.push({
            name: 'app.lobby',
            url: '/lobby',
            sticky: true,
            views: {
                lobby: {
                    controller: 'LobbyCtrl',
                    controllerAs: 'lobbyCtrlVM',
                    templateUrl: 'assets/js/lobby/lobby.html'
                }
            }
        });

        states.push({
            name: 'app.user',
            url: '/user',
            sticky: true,
            views: {
                settings: {
                    controller: 'UserCtrl',
                    controllerAs: 'userCtrlVM',
                    templateUrl: 'assets/js/user/user.html'
                }
            }
        });

        states.push({
            name: 'app.ladder',
            url: '/ladder',
            sticky: true,
            views: {
                settings: {
                    controller: 'LadderCtrl',
                    controllerAs: 'ladderCtrlVM',
                    templateUrl: 'assets/js/ladder/ladder.html'
                }
            }
        });

        states.push({
            name: 'app.settings',
            url: '/settings',
            sticky: true,
            views: {
                settings: {
                    controller: 'SettingsCtrl',
                    controllerAs: 'settingsCtrlVM',
                    templateUrl: 'assets/js/settings/settings.html'
                }
            }
        });

        states.push({
            name: 'app.help',
            url: '/help',
            sticky: true,
            views: {
                settings: {
                    controller: 'HelpCtrl',
                    controllerAs: 'helpCtrlVM',
                    templateUrl: 'assets/js/help/help.html'
                }
            }
        });

        states.forEach(function(state){
            $stateProvider.state(state);
        });

        $urlRouterProvider.otherwise('/app/lobby');
    }
})();