var settings = require("./JS/Resources/settings.json");

var width = settings.User.Camera["Width"];
var height = settings.User.Camera["Height"];
var time = settings.User.Camera["Time"];
var extraCommands = settings.User.Camera["Extra Commands"];
var port = settings.User.Camera.Network["Port"];
var ip = settings.User.Camera.Network["IP"];
var command = `raspivid -w ${width} -h ${height} -t ${time} ${extraCommands} | nc ${ip} ${port}`;

//Put in default text
function loaded() {
    console.log("Loaded!");
    document.forms[0].elements[1].value = height;
    document.forms[0].elements[2].value = width;
    document.forms[0].elements[3].value = time;
    document.forms[0].elements[4].value = port;
    document.getElementById('settingsIP').innerHTMl = ip;
}

function startCamera() {
    height = document.forms[0].elements[1].value
    width = document.forms[0].elements[2].value
    time = document.forms[0].elements[3].value
    port = document.forms[0].elements[4].value
    command = `raspivid -w ${width} -h ${height} -t ${time} ${extraCommands} | nc ${ip} ${port}`
}
