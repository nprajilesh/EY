#!/usr/bin/env node

var amqp = require('amqplib');
amqp.connect('amqp://192.168.0.67').then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertExchange('logs', 'direct', {durable: false});
    ok = ok.then(function() {
      return ch.assertQueue('111', {exclusive: true});
    });
    ok = ok.then(function(qok) {
      return ch.bindQueue(qok.queue, 'logs', 'hello').then(function() {
        return qok.queue;
      });
    });
    ok = ok.then(function(queue) {
      return ch.consume(queue, logMessage, {noAck: true});
    });

 var ok = ch.assertExchange('logs', 'direct', {durable: false});
    ok = ok.then(function() {
      return ch.assertQueue('222', {exclusive: true});
    });
    ok = ok.then(function(qok) {
      return ch.bindQueue(qok.queue, 'logs', 'hello1').then(function() {
        return qok.queue;
      });
    });

    ok = ok.then(function(queue) {
      return ch.consume(queue, logMessage, {noAck: true});
    });
    return ok.then(function() {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');
    });

    function logMessage(msg) {
      console.log(" [x] '%s'", msg.content.toString());
    }
  });
}).then(null, console.warn);
