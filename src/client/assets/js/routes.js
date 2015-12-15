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
            name: 'app.create',
            url: '/create',
            views: {
                create: {
                    templateUrl: 'assets/js/game/create.html'
                }
            }
        });

        states.push({
            name: 'app.game',
            url: '/game',
            sticky: true,
            params: {
              create: null
            },
            views: {
                game: {
                    controller: 'GameCtrl',
                    controllerAs: 'gameCtrlVM',
                    templateUrl: 'assets/js/game/game.html'
                }
            }
        });

        states.push({
            name: 'app.ladder',
            url: '/ladder',
            sticky: true,
            views: {
                ladder: {
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
                help: {
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