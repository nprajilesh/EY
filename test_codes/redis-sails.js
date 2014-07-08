/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 * 
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *   => `node app.js`
 *   => `forever start app.js`
 *   => `node debug app.js`
 *   => `modulus deploy`
 *   => `heroku scale`
 * 
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */

var http1 = require('http');

const redis = require('redis');
const client = redis.createClient();
console.log('connected to redis server');

    const subscribe = redis.createClient()
    subscribe.subscribe('ch1');
    subscribe.on("message", function(channel, message) 
    {

        jsonObject = JSON.stringify({
            "emp_id" : 300,
            "name" : "Rohan"
         });
         
        // prepare the header
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
        };
         
        // the post options
        var optionspost = {
            host : 'localhost',
            port : 1337,
            path : '/employee/create',
            method : 'POST',
            headers : postheaders
        };
         
        console.info('Options prepared:');
        console.info(optionspost);
        console.info('Do the POST call');
         
        // do the POST call
        var reqPost = http1.request(optionspost, function(res) {
            console.log("statusCode: ", res.statusCode);
            // uncomment it for header details
        //  console.log("headers: ", res.headers);
         
            res.on('data', function(d) {
                console.info('POST result:\n');
                process.stdout.write(d);
                console.info('\n\nPOST completed');
            });
        });
         
        // write the json data
        reqPost.write(jsonObject);
        reqPost.end();
        reqPost.on('error', function(e) {
            console.error(e);
        });
        
    });





var sails;
try {
    sails = require('sails');
} catch (e) {
    console.error('To run an app using `node app.js`, you usually need to have a version of `sails` installed in the same directory as your app.');
    console.error('To do that, run `npm install sails`');
    console.error('');
    console.error('Alternatively, if you have sails installed globally (i.e. you did `npm install -g sails`), you can use `sails lift`.');
    console.error('When you run `sails lift`, your app will still use a local `./node_modules/sails` dependency if it exists,');
    console.error('but if it doesn\'t, the app will run with the global sails instead!');
    return;
}

// Try to get `rc` dependency
var rc;
try {
    rc = require('rc');
} catch (e0) {
    try {
        rc = require('sails/node_modules/rc');
    } catch (e1) {
        console.error('Could not find dependency: `rc`.');
        console.error('Your `.sailsrc` file(s) will be ignored.');
        console.error('To resolve this, run:');
        console.error('npm install rc --save');
        rc = function () { return {}; };
    }
}


// Start server
sails.lift(rc('sails'));
