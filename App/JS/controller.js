function resetElement(id) {
  var element = document.getElementById(id);

  if (element !== null) {
    var parent = element.parentNode;
    parent.removeChild(element);

    element = document.createElement('div');
    element.setAttribute('id', id);
    parent.insertBefore(element, document.getElementById('marker'));
  }
}
var interval = 10;
setInterval(function(){
  var gamepads = navigator.getGamepads();
  resetElement('controllers');
  if (gamepads[0] !== null) {
    var parent = document.getElementById('controllers');

    for (var i = 0; i <= gamepads.length; i++) {
      var gamepad = gamepads[i];

      if (gamepad !== null && i !== 4) {
        var info = document.createElement('h3');
        info.setAttribute('id', `ID ${i}`);
        info.innerHTML = String(gamepad.id);
        parent.appendChild(info)

        var table = document.createElement('table');
        table.setAttribute('id', `Controller ${i}`)
        parent.appendChild(table)

        var infoRow = document.createElement('tr');
        infoRow.setAttribute('id', 'info');
        table.appendChild(infoRow);

        for (var c = 0; c <= 2; c++) {
          var heading = document.createElement('th');
          heading.setAttribute('id', `Info ${c}`);
          infoRow.appendChild(heading);
        }

        document.getElementById('Info 0').innerHTML = 'Type';
        document.getElementById('Info 1').innerHTML = 'Number';
        document.getElementById('Info 2').innerHTML = 'Value';

        for (var x = 0; x < gamepad.axes.length; x++) {
          var row = document.createElement('tr');
          row.setAttribute('id', `Axis ${x}`)
          table.appendChild(row)

          for (var z = 0; z < 3; z++) {
            var data = document.createElement('td');
            if (z == 2) {
              data.setAttribute('id', `0, ${i}, ${x}`)
            } else if (z == 0){
              data.setAttribute('id', `0, ${i}, ${x}, ${z}`);
              data.innerHTML = 'Axis';
              data.setAttribute('class', 'axis');
            } else {
              data.setAttribute('id', `0, ${i}, ${x}, ${z}`);
              data.innerHTML = `${x+1}`;
              data.setAttribute('class', 'number');
            }
            table.appendChild(data);
          }
        }

        for (var y = 0; y < gamepad.buttons.length; y++) {
          var row = document.createElement('tr');
          row.setAttribute('id', `Axis ${y}`)
          table.appendChild(row)

          for (var z = 0; z < 3; z++) {
            var data = document.createElement('td');
            if (z == 2) {
              data.setAttribute('id', `1, ${i}, ${y}`)
            } else if (z == 0){
              data.setAttribute('id', `1, ${i}, ${y}, ${z}`);
              data.innerHTML = 'Button';
              data.setAttribute('class', 'button');
            } else {
              data.setAttribute('id', `1, ${i}, ${y}, ${z}`);
              data.innerHTML = `${y+1}`;
              data.setAttribute('class', 'number');
            }
            table.appendChild(data);
          }
        }

        // for (var y = 0; y < gamepad.buttons.length; y++) {
        //   var row = document.createElement('tr');
        //   row.setAttribute('id', `Axis ${y}`)
        //   table.appendChild(row)
        //
        //   for (var z = 0; z < 2; z++) {
        //     var data = document.createElement('td');
        //     if (z == 2) {
        //       data.setAttribute('id', `1, ${i}, ${y}`)
        //     } else if (z == 0){
        //       data.setAttribute('id', `1, ${i}, ${y}`);
        //       data.innerHTML = 'Button';
        //       data.setAttribute('class', 'button');
        //     } else {
        //       data.setAttribute('id', `1, ${i}, ${y}`);
        //       data.innerHTML = `${y+1}`;
        //       data.setAttribute('class', 'number');
        //     }
        //     table.appendChild(data);
        //   }
        // }

        // for (var y = 0; y < gamepad.buttons.length; y++) {
        //   var button = document.createElement('p');
        //   button.setAttribute('id', `Button #${y}`);
        //   controller.appendChild(button);
        //
        //   gamepad.buttons[y].pressed? button.innerHTML = "Pressed" : button.innerHTML = "Not Pressed"
        //   button.innerHTML += `, value ${gamepad.buttons[y].value}`
        //   // console.log(gamepad.buttons[x])
        // }

        for (var x = 0; x < gamepad.axes.length; x++) {
          var value = document.getElementById(`0, ${i}, ${x}`);
          value.innerHTML = gamepad.axes[x]
          gamepad.axes[x] > 0 ? value.setAttribute('class', 'positive') : value.setAttribute('class', 'negative')
        }

        for (var y = 0; y < gamepad.buttons.length; y++) {
          var value = document.getElementById(`1, ${i}, ${y}`);
          value.innerHTML = gamepad.buttons[y].value
          gamepad.buttons[y].value > 0? value.setAttribute('class', 'positive') : value.setAttribute('class', 'negative')
        }

        // for (var y = 0; y < gamepad.buttons.length; y++) {
        //   var button = document.createElement('p');
        //   button.setAttribute('id', `Button #${x}`);
        //   controller.appendChild(button);
        //
        //   gamepad.buttons[y].pressed? button.innerHTML = "Pressed" : button.innerHTML = "Not Pressed"
        //   button.innerHTML += `, value ${gamepad.buttons[y].value}`
        //   // console.log(gamepad.buttons[x])
        // }
      }
    }
  }
}, interval)
