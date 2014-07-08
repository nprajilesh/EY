/*
 Node.js server script
 Required node packages: express, redis, socket.io
*/
const PORT = 3000;
const HOST = 'localhost';



var express = require('express'),
 http = require('http'), 
 server = http.createServer(app);

var app = express();

const redis = require('redis');
const client = redis.createClient();
//log('info', 'connected to redis server');

const io = require('socket.io');

if (!module.parent) {
 server.listen(3000);
 const socket  = io.listen(server);

 socket.on('connection', function(client) {
    const subscribe = redis.createClient()
    subscribe.subscribe('ch');
        log('info','mongo connected');
    
    subscribe.on("message", function(channel, message) {
      //  log('info','mongo connected');
        var obj =JSON.parse(message);
     //   MongoClient.connect('mongodb://192.168.0.110:27017/assets', function(err, db) {
        
  /*    Connect to mongo db*/

         //   if(err) throw err;

  /*    Convert incoming string to JSON     */

            

  /*    Insert Message to log database    */

        
        console.log(obj);
        client.send(obj);
        log('msg',"send "+JSON.stringify(obj));
        log('msg', "received from channel #" + channel + " : " + message);
       // db.close();
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

