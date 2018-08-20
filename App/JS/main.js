<<<<<<< HEAD
var shell = require('shelljs');
var util = require('util');
=======
var shell = require('shelljs');

var PythonShell = require('python-shell');
var pyshell = new PythonShell('App/JS/Resources/Python/test.py');

pyshell.send('hello');

pyshell.on('message', function (message) {
  console.log('Message from Python: ' + message);
});

pyshell.end(function (err,code,signal) {
  if (err) throw err;
  console.log('Execution finished.')
  console.log('The exit code was: ' + code);
  console.log('The exit signal was: ' + signal);
});
>>>>>>> 4f2e68fe2ffae13d506c60b3e2a3f2433208368a
