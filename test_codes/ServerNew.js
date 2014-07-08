/*
    Node.js server script
    Required node packages: express, redis, socket.io
*/
const PORT = 3000;
const HOST = 'localhost';
var i;
var username,empid;
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var express = require('express'),
    http = require('http'), 
    server = http.createServer(app);

var app = express();

const redis = require('redis');
const client = redis.createClient();
log('info', 'connected to redis server');

const io = require('socket.io');

if (!module.parent) {
    server.listen( 3000);
    const socket  = io.listen(server);
	
    socket.on('connection', function(client) {
        const subscribe = redis.createClient()
        subscribe.subscribe('ch');
	
        subscribe.on("message", function(channel, message) {
          var obj =JSON.parse(message);
      		MongoClient.connect('mongodb://127.0.0.1:27017/assets', function(err, db) {
      		    if(err) throw err;
                  //log('msg','Mongo Loop Entered');
                  /*  var collection = db.collection("logtracker");
                    collection.insert(obj, {safe: true}, function(err, records){
                    });*/
            var collection = db.collection("tracker");
            for(i=0;i<obj.count;i++)
              {
                  collection.findOne({'mac':obj.members[i].mac},function(err, results){
                           username = results.username ;
                           empid = results.empid ;
                    
                  });

                    obj.members[i].username=username;
                    obj.members[i].empid=empid;

              
              }
      		
             client.send(JSON.stringify(obj));
            log('msg---------------',"send "+JSON.stringify(obj));                       
      		});

            log('msg', "received from channel #" + channel + " : " + message);
            
        });

        client.on('message', function(msg) {
            log('debug', msg);
        });

        client.on('disconnect', function() {
            log('warn', 'disconnecting from redis');
            subscribe.quit();
        });
    });
}

function log(type, msg) {

    var color   = '\u001b[0m',
        reset = '\u001b[0m';

    switch(type) {
        case "info":
            color = '\u001b[36m';
            break;
        case "warn":
            color = '\u001b[33m';
            break;
        case "error":
            color = '\u001b[31m';
            break;
        case "msg":
            color = '\u001b[34m';
            break;
        default:
            color = '\u001b[0m'
    }

    console.log(color + '   ' + type + '  - ' + reset + msg);
}
