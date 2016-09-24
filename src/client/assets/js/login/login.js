var ipc = require('electron').ipcRenderer;

angular.module('login', []);

angular.module('login').controller('LoginFormCtrl', LoginFormCtrl);

LoginFormCtrl.$inject = ['$http'];
function LoginFormCtrl($http) {
    var vm = this;

    vm.submit = function() {
        if (!vm.nick || !vm.username || !vm.password) return;

        var url = 'http://ladder.cncnet.org/api/auth/' + vm.nick;
        var token = window.btoa([vm.username, vm.password].join(':'));
        var request = {
            method: 'GET',
            url: url,
            headers: {
                Authorization: 'Basic ' + token
            }
        };

        $http(request).then(success, error);

        function success() {
            ipc.send('asynchronous-message', {
                event: 'authenticated',
                nick: vm.nick,
                username: vm.username
            });
        }

        function error() {
            alert('CnCNet Forum Credentials Incorrect');
        }
    };
}

angular.module('login').directive('loginForm', function () {
    return {
        restrict: 'E',
        controller: 'LoginFormCtrl',
        controllerAs: 'loginFormCtrlVm',
        templateUrl: 'assets/js/login/form.html'
    }
});