const rp = require('request-promise');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const net = require('net');
const client = new net.Socket();

/**
 * Parses all elements in a given Dynamixel table and converts them to CSV
 * @param {Object} table The table returned when executing parsetable
 * @param {Boolean} includeHeader If the CSV should include headings - use
 * false if this is not the top item in the table
 * @return {String} A string of CSV data with the control table
 */
function parseDynamixelTable(table, includeHeader) {
  let build = '';
  for (let i = includeHeader? 0 : 1; i < table[0].length; i++) {
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

function getFile() {
  const link = document.getElementById('url').value;
  const re = /^https?:\/\/emanual\.robotis\.com\/docs\/en\/dxl\/[a-z0-9]+\/[a-z0-9]+-?[a-z0-9]+/
  const res = link.match(re)
  if (res !== null && res !== undefined) {
    console.log(`Extracted URL as ${res[0]}`);
    rp(link)
      .then(function(html) {
        console.log('Successfully downloaded the site!');
        /*
        What the Table looks like
        +---------+--------------+--------+
        | Address | Size (Bytes) | Name   |
        +---------+--------------+--------+
        | Integer | Integer      | String |
        +---------+--------------+--------+
        And so on
        */
        console.log('Scraping the table data...');
        const $ = cheerio.load(html);
        cheerioTableparser($);
        const EEPROMtable = $('table').eq(1).parsetable(true, true, true);
        const RAMtable = $('table').eq(2).parsetable(true, true, true);
        let fileData = '';
        fileData += parseDynamixelTable(EEPROMtable, true);
        fileData += parseDynamixelTable(RAMtable, false);
        const linkPieces = link.split('/');
        if (linkPieces[linkPieces.length - 1] == '') {
          linkPieces.pop(linkPieces.length - 1);
        }

        const filename = linkPieces[linkPieces.length - 1];
        client.on('error', function(err) {
          console.error('Unable to connect to the fileserver!' + '\n' + 
          'Ensure that the robot is powered and active.');
        })
        client.connect(5004, '127.0.0.1', function() {
          client.write(`${filename}\n${fileData}`);
          client.destroy();
        })
        console.log('Done!');
      })
      .catch(function(err) {
        console.error('An error has occured!');
        console.error('Check that you have an active internet connection');
        console.error('Additionally, check that you are able to access sites');
        console.error(err);
    });
  } else {
    console.error('It seems that your URL is invalid!');
  }
}