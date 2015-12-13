var ipc = require('electron').ipcRenderer;
var socket = io.connect('http://localhost:4008');
var user = {};

angular.module('app').controller('LobbyCtrl', LobbyCtrl);

LobbyCtrl.$inject = ['$scope', '$filter']
function LobbyCtrl($scope, $filter) {
    var vm = this;

    vm.chat = angular.element(document.getElementsByClassName('chat'));
    vm.users = angular.element(document.getElementsByClassName('users'));
    vm.topic = 'Play classic Command & Conquer games online ...';
    vm.nicklist = [];

    vm.submit = function() {
        console.log('vm.message', vm.message);

        var message = vm.message;
        vm.message = '';

        if (!user.nick || !user.channel) return;

        socket.emit('*', {
            event: 'privmsg',
            destination: user.channel,
            message: message
        });

        var elem = angular.element('<div></div>');
        vm.chat.append(elem.html(timestamp() + '&lt;'+ user.nick +'&gt;: ' + message));
    };

    socket.on('connect', function () {
        socket.emit('*', {
            event: 'whoami'
        });
    });

    socket.on('disconnect', function () {

    });

    socket.on('whoami', function(data) {
        console.log(data);
        user = data;
    });

    socket.on('topic', function(data) {
        console.log(data);
        vm.topic = data.message;
        $scope.$apply();
    });

    socket.on('names', function(data) {
        console.log(data);

        for (var i = 0, x = data.message.length; i < x; i++) {
            if (vm.nicklist.indexOf(data.message[i]) < 0) {
                vm.nicklist.push(data.message[i]);
            }
        }

        $scope.$apply();
    });

    socket.on('quit', function(data) {
        console.log(data);

        var index = vm.nicklist.indexOf(data.originator);
        if (index > -1) {
            vm.nicklist.splice(index, 1);
            $scope.$apply();
        }

        var elem = angular.element('<div></div>');
        elem.addClass('user-action user-quit');
        vm.chat.append(elem.html(timestamp() + data.originator +' quit (' + data.message +')'));
    });

    socket.on('part', function(data) {
        console.log(data);

        var index = vm.nicklist.indexOf(data.originator);
        if (index > -1) {
            vm.nicklist.splice(index, 1);
            $scope.$apply();
        }

        var elem = angular.element('<div></div>');
        elem.addClass('user-action user-part');
        vm.chat.append(elem.html(timestamp() + data.originator +' left ' + data.destination));
    });

    socket.on('join', function(data) {
        console.log(data);

        if (vm.nicklist.indexOf(data.originator) < 0) {
            vm.nicklist.push(data.originator);
            $scope.$apply();
        }

        var elem = angular.element('<div></div>');
        elem.addClass('user-action user-join');
        vm.chat.append(elem.html(timestamp() + data.originator +' joined ' + data.destination));
    });

    socket.on('privmsg', function(data) {
        console.log(data);

        data.message = data.message.replace('\u0003', '');
        var elem = angular.element('<div></div>');
        if (data.message.indexOf('ACTION') > -1) {
            elem.addClass('user-action action');
            data.message = data.message.replace('ACTION ', '');
            vm.chat.append(elem.html(timestamp() + data.originator + ' ' + data.message));
        } else {
            var color = parseInt(data.message.substring(0,2));
            if (color && color > 0) {
                elem.addClass('user-color-' + color);
                data.message = data.message.substr(2);
            }
            vm.chat.append(elem.html(timestamp() + '&lt;'+ data.originator +'&gt;: ' + data.message));
        }
    });

    function timestamp() {
        return '<span class="timestamp">['+ $filter('date')(Date.now(), 'HH:mm:ss') +']</span> ';
    }
}