var shell = require('shelljs');

var PythonShell = require('python-shell');
//var initShell = new PythonShell('App/JS/Resources/Driving\ Code/Client-Code-2018/DoNotRunMe.py');
var pyshell = new PythonShell('App/JS/Resources/Driving\ Code/Client-Code-2018/CurrentEmuBotCode2/client.py');

//initShell.on('message', function (message) {
//  console.log('Init message: ' + message);
//});

//initShell.send('2')

pyshell.on('message', function (message) {
  console.log('Message from Python: ' + message);
  pyshell.send("RIGHT_TRG 1 1");
});

pyshell.end(function (err,code,signal) {
  if (err) throw err;
  console.log('Execution finished.')
  console.log('The exit code was: ' + code);
  console.log('The exit signal was: ' + signal);
});
