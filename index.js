// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

//redis connection && sub/pub
var redis = require('redis');
var sub = redis.createClient(),pub = redis.createClient();
var msg = 0;

sub.on('subscribe',function(channel,count){
    pub.publish("a nice channel","I am sending a message.");
    pub.publish("a nice channel", "I am sending a second message.");
    pub.publish("a nice channel", "I am sending my last message.");
    console.log(channel);
    console.log(count);
});

sub.on('message',function(channel,message){
    console.log('sub channel '+channel+":"+message);
    msg += 1;
    if(msg === 3){
        sub.unsubscribe();
        sub.quit();
        pub.quit();
    }
})

sub.subscribe("a nice channel");


server.listen(port, ()=>{
    console.log('SyncServer listening at port %d',port);
});

//Routing
app.use(express.static(path.join(__dirname,'public')));

//SyncData
var numOfUers = 0;
io.on('connection',(socket)=>{
    
    var addedUser = false;
    
    /**add user**/
    //when the client emits 'add user',this listens and executes
    socket.on('add user',(username)=>{
        //?
        if(addedUser) return;
        
        //we store the username in the socket session for this client
        socket.username = username;
        ++numOfUers;
        addedUser = true;
        socket.emit('login',{
            numOfUers:numOfUers
        });

        //broadcast all clients that a person has connected
        socket.broadcast.emit('user joined',{
            username:socket.username,
            numOfUers:numOfUers
        });
    });


    /**editting**/
    //when the client emits 'editting',server broadcast it to others
    socket.on('editting',()=>{
        socket.broadcast.emit('editting',{
            username:socket.username
        });
    });

    /**stop editting**/
    //when the client emits 'stop editting', server broadcast it to others
    socket.on('stop editting',()=>{
        socket.broadcast.emit('stop editting',{
            username:socket.username
        });
    });

    /**update data**/
    //when the client emits 'update data',this listen and executes
    socket.on('update data',(data)=>{
        //server will broadcast to all client to execute 'update data'
        socket.broadcast.emit('update data',{
            username: socket.username,
            message:data
        });
    });

    /**disconnection**/
    //when the user disconnection,server broadcast to all the clients
    socket.on('disconnection',()=>{
        if(addedUser){
            --numOfUers;

        //broadcast to all the client
        socket.broadcast.emit('user left',{
            username:socket.username,
            numOfUers:numOfUers
        });
        }
    });

});