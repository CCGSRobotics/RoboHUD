var settings = require("./JS/Resources/settings.json")
var width = settings.User.Camera["Width"]
var height = settings.User.Camera["Height"]
var time = settings.User.Camera["Time"]
var extraCommands = settings.User.Camera["Extra Commands"]
var port = settings.User.Camera.Network["Port"]
var ip = settings.User.Camera.Network["IP"]
var command = `raspivid -w ${width} -h ${height} -t ${time} ${extraCommands} | nc ${ip} ${port}`

//Put in default text
function loaded() {
    console.log("Loaded!")
    document.forms[0].elements[0].value = command
    document.forms[0].elements[2].placeholder = height
    document.forms[0].elements[3].placeholder = width
    document.forms[0].elements[4].placeholder = time
    document.forms[0].elements[5].placeholder = port
    document.getElementById('settingsIP').innerHTMl = ip
    console.log(document.getElementById('settingsIP'))
    console.log(document.forms)
}
function startCamera() {
    console.log("placeholder")
}
