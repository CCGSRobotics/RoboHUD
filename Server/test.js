var net = require('net');
const { spawn } = require('child_process')

// console.log('Server interface started and listening on port 5000')
// var code = execute('python3 test.py')
// code.stdout.on("data", function(data) {
//   console.log(data)
// })

var scribe = require('scribe-js')(),
    console = process.console,
    express = require('express'),
    app = express();


app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
    res.send('Hello world, see you at /logs');
});

app.use('/logs', scribe.webPanel());

// Feel free to mess around with the colours, this is just what I could think of
console.addLogger('debug', 'purple');
// ---------------------------------
console.addLogger('stdout', 'green');
console.addLogger('out', 'green');
// ---------------------------------
console.addLogger('stderr', 'red');
console.addLogger('error', 'red');
// ---------------------------------
console.addLogger('client', 'blue');

var port = app.get("port");

app.listen(port, function() {
    console.time().debug('Server listening at port ' + port);
});

function spawnNewChild(command, args) {
  var child = spawn(command, args);

  child.stdout.on('data', (data) => {
    console.time().stdout(`Child stdout:\n${data}`);
  });

  child.stderr.on('data', (data) => {
    console.time().stderr(`Child stderr:\n${data}`);
  });

  child.on('exit', function (code, signal) {
    console.time().debug(`Child process exited with code ${code} and signal ${signal}`);
  });

  child.on('error', function(data) {
    console.time().err(data)
  })

  return child;
}
setTimeout(function() {
  var pythonServer = spawnNewChild('python3', ['./Server-Code-2018/RoboCupServer-Current.py']);
}, 1500)

// console.time().fun('hello world');
// console.tag('This is a test').debug('A test');
// console.tag('An object').log({
//     a: 'b',
//     c: [1, 2, 3]
// });

// setTimeout()
// net.createServer(function(socket) {
// 	console.log("New client connected");
// 	execute("pkill python3; pkill raspivid; pkill nc");
// 	socket.on('data', function(data) {
// 		var parsedData = data.toString()
// 		console.log(parsedData)
// 		if (parsedData == 'START') {
// 			console.log('Starting Python server...');
// 			var serverCode = execute('python3 Server-Code-2018/RoboCupServer-Current.py')
//
// 			serverCode.stdout.on('data', function (data) {
// 				console.log('stdout: ' + data.toString());
// 			});
//
// 			serverCode.stderr.on('data', function (data) {
// 				console.log('stderr: ' + data.toString());
// 			});
//
// 			serverCode.on('exit', function (code) {
// 				console.log('child process exited with code ' + code.toString());
// 			});
// 		} else if (parsedData == 'VIDEO') {
// 			console.log('Streaming video to client...');
// 			var raspivid = execute('raspivid -t 0 -o - -w 960 -h 540 -fps 25 -pf baseline -vf -hf | nc -k -l 5002');
// 			raspivid.stdout.on('data', function (data) {
//                                 console.log('stdout: ' + data.toString());
//                         });
//
//                         raspivid.stderr.on('data', function (data) {
//                                 console.log('stderr: ' + data.toString());
//                         });
//
//                         raspivid.on('exit', function (code) {
//                                 console.log('child process exited with code ' + code.toString());
//                         });
// 		}
// 	})
// 	// TODO: Terminate the child process directly instead of using pkill
// 	socket.on('end', function() {
// 		console.log("Client has terminated connection, killing Python server...");
// 		execute("pkill python3");
// 		execute("pkill raspivid; pkill nc");
// 	})
// }).listen(5000)
