const {readConfDirSync, readConfSync} = require('../../lib/io');

/**
 * Populates the select with filenames from the conf folder
 * @param {String} dir The configuration directory
 * @param {String} id The ID of the options element
 */
function populateSelect(dir, id) {
  const dirList = readConfDirSync(dir);
  const items = [];

  for (let i = 0; i < dirList.length; ++i) {
    const config = JSON.parse(readConfSync(
        `${dir}/${dirList[i]}`).toString());

    items.push(config);

    const option = document.createElement('option');
    option.innerHTML = dirList[i].split('.')[0];
    document.getElementById(id).appendChild(option);
  }
}

populateSelect('Controllers', 'controller-select');
populateSelect('Robots', 'robot-select');
