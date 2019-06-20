// Place a random sentence in the loading animation

var sentences = require('./JS/Resources/sentences.json');

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i]);
}

document.getElementById("loading-text").innerHTML = `${sentences[Math.round(Math.random() * (sentences.length - 1))]}...`;

// Tell the server to start

client.connect(5000, '192.168.100.1', function() {
  console.log("Connected to server interface");
})

function writeToServer(data) {
  client.write(data);
  console.log(`Wrote '${data}' to server`);
}

writeToServer('VIDEO');
writeToServer('START');