var sentences = require('./JS/Resources/sentences.json');

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i]);
}

document.getElementById("loading-text").innerHTML = `${sentences[Math.round(Math.random() * (sentences.length - 1))]}...`;