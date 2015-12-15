var ipc = require('electron').ipcRenderer;

angular.module('app').controller('LobbyCtrl', LobbyCtrl);

LobbyCtrl.$inject = ['$scope', '$filter', 'UserSvc', 'SocketSvc']
function LobbyCtrl($scope, $filter, UserSvc, SocketSvc) {
    var vm = this;
    var socket = SocketSvc.connection;

    vm.chat = angular.element(document.getElementById('chat'));
    vm.users = angular.element(document.getElementById('nicklist'));
    vm.topic = 'Play classic Command & Conquer games online ...';
    vm.nicklist = [];

    vm.submit = function() {
        var message = vm.message;
        vm.message = '';

        UserSvc.whoami().then(function(user) {
            socket.emit('*', {
                event: 'privmsg',
                destination: user.channel,
                message: message
            });

            var elem = angular.element('<div></div>');
            vm.chat.append(elem.html(timestamp() + '&lt;'+ user.nick +'&gt;: ' + message));
            scrollToBottom();
        });
    };

    socket.on('topic', function(data) {
        console.log(data);
        vm.topic = data.message;
        $scope.$apply();

        // app is ready
        document.getElementById('loading').style.display = 'none';
    });

    socket.on('names', function(data) {
        console.log(data);

        for (var i = 0, x = data.message.length; i < x; i++) {
            if (vm.nicklist.indexOf(data.message[i]) < 0) {
                vm.nicklist.push(data.message[i]);
                $scope.$apply();
            }
        }
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
        scrollToBottom();
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
        scrollToBottom();
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
        scrollToBottom();
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

        scrollToBottom();
    });

    function timestamp() {
        return '<span class="timestamp">['+ $filter('date')(Date.now(), 'HH:mm:ss') +']</span> ';
    }

    function scrollToBottom() {
        vm.chat[0].scrollTop = vm.chat[0].scrollHeight + 10;
    }
}