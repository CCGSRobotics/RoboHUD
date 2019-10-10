const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const net = require('net');
let link = '';
let fileData = '';
let filename = '';
let autosave;

const client = new net.Socket();
client.on('error', function(err) {
  console.error('Unable to connect to the fileserver!' + '\n' +
  ' Ensure that the robot is powered and active.');
});

/**
 * Parses the header of a given table
 * @param {Array} table
 * @return {String} The header of the specified table
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
 * @return {String} A string of CSV data with the control table
 */
function parseDynamixelTable(table) {
  let build = '';
  for (let i = 1; i < table[0].length; i++) {
    for (let x = 0; x < table.length; x++) {
      build += table[x][i].replace(',', '');
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

/**
 * Computes all HTML tables from indexes and converts to CSV
 * @param {String} html The downloaded e-Manual document as HTML
 * @param {Array} indexes The indexes of all tables involving the control table
 * @return {String} The CSV-formatted table containing all of the control table
 */
function generateCSV(html, indexes) {
  if (indexes == null || indexes == undefined || indexes.length == 0) {
    console.error('Invalid argument!' +
    'Ensure that the argument "indexes" is valid!');
    return '';
  }

  fileData = '';
  const $ = cheerio.load(html);
  cheerioTableparser($);
  const cheerioTable = $('table');

  fileData += parseDynamixelHeader(cheerioTable.eq(
      indexes[0]).parsetable(true, true, true));
  for (let i = 0; i < indexes.length; i++) {
    fileData += parseDynamixelTable(cheerioTable.eq(
        indexes[i]).parsetable(true, true, true));
  }

  return fileData;
}

/**
 * Resets the min & max inputs to their "defaultValue" attributes
 * @param {Node} elem The button element that triggered the function
 */
function resetRow(elem) { // eslint-disable-line no-unused-vars
  const parentId = elem.parentNode.id;
  const name = parentId.slice(0, parentId.length - 4);
  const min = document.getElementById(`${name}-min`);
  const max = document.getElementById(`${name}-max`);

  if (!isNaN(min.value)) {
    min.value = min.defaultValue;
  }
  if (!isNaN(max.value)) {
    max.value = max.defaultValue;
  }
  // Trigger the autosave
  max.onchange();
}

let hasMin = false;
let hasMax = false;
let hasRange = false;
let minIndex = 0;
let maxIndex = 0;
let rangeIndex = 0;
let nameIndex = 2;

/**
 * Creates a table to edit the min & max values of items in the control table
 */
function createServoTable() {
  const rows = fileData.split('\n');

  const headings = rows[0].split(', ');
  for (let i = 0; i < headings.length; ++i) {
    const heading = headings[i].toLowerCase();
    if (heading == 'data name') {
      nameIndex = i;
    }
    if (heading == 'min') {
      hasMin = true;
      minIndex = i;
    } else if (heading == 'max') {
      hasMax = true;
      maxIndex = i;
    } else if (heading == 'range') {
      hasRange = true;
      rangeIndex = i;
    }
  }

  const parent = document.getElementById('parent');

  for (let i = 1; i < rows.length - 1; ++i) {
    const columns = rows[i].split(', ');
    const title = document.createElement('td');
    const dataName = columns[nameIndex];
    title.innerHTML = dataName;

    const row = document.createElement('tr');
    row.setAttribute('id', `${columns[nameIndex]}-row`);
    row.appendChild(title);

    for (let x = 0; x < 2; ++x) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.setAttribute('id', `${dataName}-${x == 0? 'min' : 'max'}`);
      clearTimeout(autosave);
      input.onchange = () => {
        autosave = setTimeout(() => {
          saveFile();
        }, 3000); // This should be customisable
      };
      td.appendChild(input);
      row.appendChild(td);
    }

    const hide = document.createElement('button');
    hide.innerHTML = '✖';
    hide.onclick = function() {
      document.getElementById(`${dataName}-row`).style.display = 'none';
    };

    const reset = document.createElement('button');
    reset.innerHTML = '↺';
    reset.setAttribute('onclick', 'resetRow(this)');

    row.appendChild(reset);
    row.appendChild(hide);
    parent.appendChild(row);
  }

  if (hasRange && !(hasMin && hasMax)) {
    rows[0] += ', Min, Max';
    for (let i = 1; i < rows.length - 1; ++i) {
      const row = rows[i].split(', ');
      const range = row[rangeIndex];
      row.push(range);
      if (range !== '-' && range !== '...') {
        const ranges = range.split(' ~ ');
        row.push(ranges.join(', '));
      } else {
        row.push('-, -');
      }
      rows[i] = row.join(', ');
    }
    hasMin = true;
    hasMax = true;
    minIndex = rows[0].split(', ').length - 1;
    maxIndex = minIndex + 1;
  }

  if (hasMin && hasMax) {
    for (let i = 1; i < rows.length - 1; ++i) {
      const min = rows[i].split(', ')[minIndex];
      const max = rows[i].split(', ')[maxIndex];
      const name = rows[i].split(', ')[nameIndex];

      if (!isNaN(min)) {
        const minInput = document.getElementById(`${name}-min`);
        minInput.value = min;
        minInput.defaultValue = min;
      }

      if (!isNaN(max)) {
        const maxInput = document.getElementById(`${name}-max`);
        maxInput.value = max;
        maxInput.defaultValue = max;
      }
    }
  }

  parent.style.display = 'inline';
}

/**
 * Saves the current fileData using modifications from the input table
 */
function saveFile() {
  const rows = fileData.split('\n');
  const headings = rows.shift();
  const grid = [];

  for (let i = 0; i < rows.length - 1; ++i) {
    const row = rows[i].split(', ');
    const name = row[nameIndex];
    const element = document.getElementById(`${name}-row`);
    if (element.style.display !== 'none') {
      const min = document.getElementById(`${name}-min`).value;
      const max = document.getElementById(`${name}-max`).value;

      if (!isNaN(min) && min !== '') {
        row[minIndex] = min;
      }
      if (!isNaN(max) && max !== '') {
        row[maxIndex] = max;
      }
    }

    grid.push(row.join(', '));
  }

  fileData = headings + '\n';
  fileData += grid.join('\n');

  fs.writeFile(`App/JS/Resources/Servos/${filename}.csv`,
      fileData, function(err) {
        if (err) {
          console.error('Failed to write file! Do you have access?');
        }
        console.log(`Saved the file as ${filename}.csv`);
      });
}

/**
 * Downloads and converts the link to a CSV, saving it to Resources/Servos and
 *  storing it in the variable fileData
 */
function getFile() { // eslint-disable-line no-unused-vars
  const url = document.getElementById('url').value;
  const re = new RegExp(''
  + /^https?:\/\/emanual\.robotis\.com\/docs\/en\/dxl\//.source
  + /[a-z0-9_-]+\/[a-z0-9_-]+-?[a-z0-9_-]+/.source
  );
  const res = url.match(re);
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
          filename = linkPieces[linkPieces.length - 1].replace('-', '');

          const uploadButton = document.getElementById('upload');
          uploadButton.innerHTML =
          `Upload <strong>${filename}.csv</strong>`;
          uploadButton.style.display = 'inline';
          const saveButton = document.getElementById('save');
          saveButton.style.display = 'inline';
          saveButton.setAttribute('onclick', `saveFile()`);

          createServoTable();
          saveFile();
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

/**
 * Uploads the data stored in fileData through TCP to a listening fileserver
 */
function uploadFile() { // eslint-disable-line no-unused-vars
  if (fileData == null || fileData == undefined || fileData == '') {
    console.error('There is no downloaded file!');
    return;
  }

  client.connect({
    port: 5004,
    address: '127.0.0.1',
  });

  client.on('connect', function() {
    client.write(`${filename}\n${fileData}`);
    console.log('Wrote file to server!');
  });

  console.log('Uploaded table!');
}
