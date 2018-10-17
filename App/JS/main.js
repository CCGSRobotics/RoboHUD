const execute = require('./JS/executeShellCommand.js').execute;
function controlServerCode(terminate) {
    if (terminate == true) {
        console.log(terminate)
        execute("sshpass -p \"raspberry\" ssh pi@192.168.100.1 'pkill -f \"python3 Desktop/Server-Code-2018/RoboCupServer-Current.py\"'");
    } else {
        execute("sshpass -p \"raspberry\" ssh pi@192.168.100.1 'python3 Desktop/Server-Code-2018/RoboCupServer-Current.py'");
        console.log("Server initiation command sent")
        document.getElementById('status').innerHTML = "Starting..."
        setTimeout(function() {
            execute('python3 App/JS/Resources/CurrentEmuBotCode2/client.py');
            document.getElementById('status').innerHTML = "Vroom Vroom!"
        }, 3000)
    }
}
