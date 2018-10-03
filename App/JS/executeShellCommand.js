var exec = require('child_process').exec;

function execute(command) {
	command = String(command);

	exec(command, function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	         console.log('exec error: ' + error);
	    }
	});
};

module.exports = { execute };
