var shell = require('shelljs');
const spawn = require('child_process').spawn;

const runTests = spawn('python', ['Resources/Python/test.py', 42]);

runTests.stdout.on('data', (data) => {
  console.log(data)
})
