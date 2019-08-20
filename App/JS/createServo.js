const rp = require('request-promise');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const net = require('net');
let link = '';
let fileData = '';
let filename = '';

const client = new net.Socket();
client.on('error', function(err) {
  console.error('Unable to connect to the fileserver!' + '\n' + 
  'Ensure that the robot is powered and active.');
})

/**
 * Parses the header of a given table
 * @param {Array} table 
 * @returns {String} The header of the specified table
 */
function parseDynamixelHeader(table) {
  let build = '';
  for (let col = 0; col < table.length; col++) {
    build += table[col][0];
    if (col < table.length - 1) {
      build += ', ';
    } else {
      build += '\n';
    }
  }
  return build;
}

/**
 * Parses all elements in a given Dynamixel table and converts them to CSV
 * @param {Object} table The table returned when executing parsetable
 * @param {Boolean} includeHeader If the CSV should include headings - use
 * false if this is not the top item in the table
 * @returns {String} A string of CSV data with the control table
 */
function parseDynamixelTable(table) {
  let build = '';
  for (let i = 1; i < table[0].length; i++) {
    for (let x = 0; x < table.length; x++) {
      build += table[x][i];
      if (x < table.length - 1) {
        build += ', ';
      }
    }
    if (i < table[0].length) {
      build += '\n';
    }
  }
  return build;
}

function generateCSV(html, indexes) {
  if (indexes == null || indexes == undefined || indexes.length == 0) {
    console.error('Invalid argument!' + 
    'Ensure that the argument "indexes" is valid!');
    return '';
  }
  
  let fileData = '';
  const $ = cheerio.load(html);
  cheerioTableparser($);
  const cheerioTable = $('table');
  
  fileData += parseDynamixelHeader(cheerioTable.eq(
    indexes[0]).parsetable(true, true, true));
  for (var i = 0; i < indexes.length; i++) {
    fileData += parseDynamixelTable(cheerioTable.eq(
      indexes[i]).parsetable(true, true, true));
    }
    
    return fileData;
  }
  
  function getFile() {
    const url = document.getElementById('url').value;
    const re = /^https?:\/\/emanual\.robotis\.com\/docs\/en\/dxl\/[a-z0-9]+\/[a-z0-9]+-?[a-z0-9]+/
    const res = url.match(re)
    if (res !== null && res !== undefined) {
      link = res[0];
      console.log(`Extracted URL as ${link}`);
      rp(link)
      .then(function(html) {
        console.log('Successfully downloaded the site!' +
        ' Now scraping the data...');
        fileData = generateCSV(html, [1, 2]);
        console.log('Downloaded table!');

        const linkPieces = link.split('/');
        if (linkPieces[linkPieces.length - 1] == '') {
          linkPieces.pop(linkPieces.length - 1);
        }
        filename = linkPieces[linkPieces.length - 1];

        uploadButton = document.getElementById('upload')
        uploadButton.innerHTML =
          `Upload <strong>${filename.replace('-', '')}.csv</strong>`;
        uploadButton.style.display = null;
      })
      .catch(function(err) {
        console.error('An error has occured!' + '\n' +
        'Check that you have an active internet connection' + '\n' +
        'Additionally, check that you are able to access sites' + '\n' +
        'This may be due to you being connected to the robot' + '\n' +
        `Recieved error: \n${err}`);
      });
  } else {
    console.error('It seems that your URL is invalid!');
  } 
}

function uploadFile() {
  if (fileData == null || fileData == undefined || fileData == '') {
    console.error('There is no downloaded file!');
    return;
  }

  client.connect({
    port: 5004,
    address: '127.0.0.1'
  });
  
  client.on('connect', function() {
    client.write(`${filename}\n${fileData}`);
    console.log('Wrote file to server!');
  })
  
  console.log('Uploaded table!');
}