var exec = require('child_process').exec;
var hasErrored = 0

function execute(command) {
	command = String(command);

	exec(command, function (error, stdout, stderr) {
	    console.log('Stdout: ' + stdout);
	    console.error('Stderr: ' + stderr);
	    if (error !== null) {
			if (hasErrored < 5) {
		         alert('Execution Error. Try looking at the documentation for possible sources of error. If the problem persists, please report this with the following error message:\n' + error)
				 hasErrored += 1
			} else {
				console.warn("Execution Error, but max prompt limit reached. " + error)
			}
		}
	});
};

module.exports = { execute };
