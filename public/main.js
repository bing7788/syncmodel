'use strict';
(function(){

    var socket = io();

    //some variable
    var username = 'bing';
    var connected = false;
    var editting = false;

    socket.emit('add user', username);

    socket.on('login', (data) => {
        connected = true;
        console.log("numOfUsers is " + data);
        console.log("socket.id is" + socket.id);
    });

    socket.on('user joined', (data) => {
        console.log(data.username + " come in");
    });
})();