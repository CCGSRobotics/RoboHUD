var net = require('net');
var execute = require('child_process').exec;

function execute(command) {
	command = String(command);

	exec(command, function (error, stdout, stderr) {
		console.log("Stdout: " + stdout);
		console.error("Stderr: " + stderr);
		if (error !== null) {
			if (hasErrored < 999999999) {
				console.error("Execution Error. Try looking at the documentation for possible sources of error. If the problem persists, please report this with the following error messages")
				hasErrored += 1
			} else {
				console.error("Execution Error, but max prompt limit reached. " + error)
			}
		}
	});
};

console.log('Server interface started and listening on port 5000')
net.createServer(function(socket) {
	console.log("New client connected");
	execute("pkill python3; pkill raspivid; pkill nc");
	socket.on('data', function(data) {
		var parsedData = data.toString()
		console.log(parsedData)
		if (parsedData == 'START') {
			console.log('Starting Python server...');
			var serverCode = execute('python3 Server-Code-2019/RoboCupServer-Current.py')

			serverCode.stdout.on('data', function (data) {
				console.log('stdout: ' + data.toString());
			});

			serverCode.stderr.on('data', function (data) {
				console.log('stderr: ' + data.toString());
			});

			serverCode.on('exit', function (code) {
				console.log('child process exited with code ' + code.toString());
			});
		} else if (parsedData == 'VIDEO') {
			console.log('Streaming video to client...');
			var raspivid = execute('raspivid -t 0 -o - -w 960 -h 540 -fps 25 -pf baseline -vf -hf | nc -k -l 5002');
			raspivid.stdout.on('data', function (data) {
                                console.log('stdout: ' + data.toString());
                        });

                        raspivid.stderr.on('data', function (data) {
                                console.log('stderr: ' + data.toString());
                        });

                        raspivid.on('exit', function (code) {
                                console.log('child process exited with code ' + code.toString());
                        });
		}
	})
	// TODO: Terminate the child process directly instead of using pkill
	socket.on('end', function() {
		console.log("Client has terminated connection, killing Python server...");
		execute("pkill python3");
		execute("pkill raspivid; pkill nc");
	})
}).listen(5000)
