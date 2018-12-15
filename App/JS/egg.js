// Egg

var list = [13, 13, 14, 14, 15, 16, 15, 16, 2, 1, 10]
var newList = []
var egg = false
var interval = 10

var interval = setInterval(function() {
  var gamepads = navigator.getGamepads()

  for (var i = 0; i < gamepads.length; i++) {
    var gamepad = gamepads[i]

    if (gamepad !== null) {
      for (var x = 0; x < list.length; x++) {
        // console.log(x, gamepad.buttons[list[x]].pressed)
        if (gamepad.buttons[list[x]].pressed == true) {
          newList.push(list[x])
        }
      }
    }
  }
  if (list == newList) {
    egg = true;
    console.log("Egg");
    clearInterval(interval)
  }
  // console.log(newList)
}, interval)
