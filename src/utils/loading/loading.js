// Place a random sentence in the loading animation
const {sentences} = require('./JS/Resources/sentences.json');

document.getElementById('loading-text').innerHTML =
`${sentences[Math.round(Math.random() * (sentences.length - 1))]}...`;

// This code is where to initialise the motion & driving server (port 5000)
