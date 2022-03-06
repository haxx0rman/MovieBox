// one of my first (if not my first ever) node project
var fs = require('fs'), request = require('request');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80
var path = require('path');


var video_time = 0;
var daddy = io;
var video = "Neon Demon.mp4"; //default video.
var videoDir = "../../../media/micky/T-Rex/Micky/Videos/" // movie directory on old server

var updateloop = new Interval(function(){ // update event to keep video players in sync
  socket.emit('count', Object.keys(io.sockets.connected).length);
  daddy.emit('gimme time');
  daddy.broadcast.emit('video time', video_time);
 }, 3000);

app.get('/', function(req, res){

  res.sendFile(__dirname + '/public/index.html');
});

app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/public/chat.html');
});

app.get('/favicon', function(req, res){
  res.sendFile(__dirname + '/public/images/favicon.png');
});

app.get('/video', function(req, res){
  res.sendFile(videoDir + video);
});

app.get('/videos', function(req, res){ //TODO: generates the html with the video list. Very inefficient. rewrite it to use standard html gen techniques
  fs.readFile(__dirname + "/public/video_listp1.txt", "utf8", function(err, p1) {
    fs.readFile(__dirname + "/public/video_listp2.txt", "utf8", function(err, p2) {
      var packet = "";
      fs.readdirSync(videoDir).forEach(file => {
        var add = "<button class=\"button button--ghost\" id=\"" + file + "\" onclick=\"whichButton(this)\">" + file.slice(0, -4) + "</button>"
        packet = packet + "\n" + add;
      })
      var html = p1 + packet + p2;
      fs.writeFile(__dirname +  "/public/video_list.html", html, function(err) {
        if(err) {
            return console.log(err);
        }
        res.sendFile(__dirname + '/public/video_list.html');
      });
    });
  });
});

app.get('/setVideo/:id', function(req, res){
  video = req.params.id;
  video_time = 0;

  res.sendFile(videoDir + video);
});

function Interval(fn, time) {
    var timer = false;
    this.start = function () {
        if (!this.isRunning())
            timer = setInterval(fn, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function sanitize (body) {
       return body
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/&/g, "&amp;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

io.on('connection', function(socket){

  var big_gays = Object.keys(io.sockets.connected).length;
  if (big_gays < 2 ) {
    daddy = socket;
    io.emit('chat message',  { 'msg' : "<b>You now have the remote</b> ", 'count': Object.keys(io.sockets.connected).length, 'time' : video_time });
  }

  socket.broadcast.emit('chat message',  { 'msg' : "<b> someone joined :0!</b> ", 'count': Object.keys(io.sockets.connected).length, 'time' : video_time });



// refresh how many are watching every 3000 ms

  if (updateloop.isRunning()){
    console.log("pingloop already running")
  } else {
    console.log("start pingloop")
    pingloop.start()
  }

// if a chat is received, push it to everyone

	  socket.on('chat message', function(msg){
	  	var username;
	  	if(msg.username === ""){
	  		username = "Guest";
	  	} else {
	  		username = msg.username;
	  	}
	    io.emit('chat message',  { 'msg' : "<b>" + username + ":</b> " + sanitize(msg.msg), 'count': Object.keys(io.sockets.connected).length, 'time' : msg.time });
	  });


    socket.on('im daddy', function(msg){ // event to become video party host
	  	daddy = socket;

      video_time = msg.time;

      var username;
	  	if(msg.username === ""){
	  		username = "Guest";
	  	} else {
	  		username = msg.username;
	  	}
      io.emit('chat message',  { 'msg' : "<b>" + username + " now has the remote</b> ", 'count': Object.keys(io.sockets.connected).length, 'time' : video_time });
	  });

    socket.on('video sync', function(data){
      //console.log(data);
	    video_time = data;
      socket.broadcast.emit('video time', video_time);

	  });

    socket.on('ping', function() {
      socket.emit('pong');
  });

  socket.on('disconnect', function () {

    var big_gays = Object.keys(io.sockets.connected).length;
    if (big_gays < 1 ) {
      video_time = 0
    }
      socket.broadcast.emit('chat message',  { 'msg' : "<b> someone left left :'0!</b> ", 'count': Object.keys(io.sockets.connected).length, 'time' : video_time });
      //console.log(socket.username + " disconnected");
    });
});



//start app

  http.listen(port, function(){
		 console.log('listening on *:' + port);
     console.log('Current Dir: ' + __dirname)

});
