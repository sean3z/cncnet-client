var ipc = require('electron').ipcRenderer;

angular.module('app').controller('GameCtrl', GameCtrl);

GameCtrl.$inject = ['$state', '$stateParams']
function GameCtrl($state, $stateParams) {
    var vm = this;

    vm.inGame = false;

    if (!$stateParams.create) {
        $state.go('app.create');
    }

    console.log('$state', $state);
    console.log('$stateParams', $stateParams);
}