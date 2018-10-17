var exec = require('child_process').exec;

function execute(command) {
	command = String(command);

	exec(command, function (error, stdout, stderr) {
	    console.log('Stdout: ' + stdout);
	    console.error('Stderr: ' + stderr);
	    if (error !== null) {
	         alert('Execution Error. Try looking at the documentation for possible sources of error. If the problem persists, please report this with the following error message:\n' + error)
	    }
	});
};

module.exports = { execute };
