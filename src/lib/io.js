const fs = require('fs');
const {remote} = require('electron');
const confDir = `${remote.getGlobal('confDir')}/conf`;

/**
 * Initialises the configuration directory
 */
function initFs() {
  const directories = ['Robots', 'Servos', 'Controllers'];
  if (!fs.existsSync(confDir)) {
    mkConfDirSync('');
  }

  const confDirs = readConfDirSync('');

  for (let i = 0; i < directories.length; ++i) {
    if (!confDirs.includes(directories[i])) {
      mkConfDirSync(directories[i]);
    }
  }

  console.log('Filesystem initialised!');
}

/**
 * Synchronously creates a configuration directory at the given path
 * @param {String} path The path to the directory
 */
function mkConfDirSync(path) {
  fs.mkdirSync(`${confDir}/${path}`);
}

/**
 * Handles a file operation error
 * @param {String} err The error message
 * @return {Boolean} If there was an error
 */
function handleErrors(err) {
  if (err !== null) {
    console.error(`File operation failed! Error:\n${err}`);
    return true;
  }

  return false;
}

/**
 * Synchronously reads a configuration file at the given path
 * @param {String} path The path to the file
 * @return {Buffer} The data contained inside the file
 */
function readConfSync(path) {
  return fs.readFileSync(`${confDir}/${path}`);
}

/**
 * Synchronously reads a configuration directory at the given path
 * @param {String} path The path to the directory
 * @return {Array<String>} An array of the directory's children
 */
function readConfDirSync(path) {
  return fs.readdirSync(`${confDir}/${path}`);
}

/**
 * Synchronously writes to a configuration file
 * @param {String} path The path to the file
 * @param {String} data The data to write to the file
 */
function writeConfSync(path, data) {
  fs.writeFileSync(`${confDir}/${path}`, data);
}

/**
 * Synchronously removes a configuration file
 * @param {String} path The path to the file
 */
function removeConfSync(path) {
  fs.unlinkSync(`${confDir}/${path}`);
}

/**
 * Reads a configuration file at the given path
 * @param {String} path The path to the file
 * @return {Promise<Buffer>} The data contained inside the file
 */
function readConf(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${confDir}/${path}`, (err, data) => {
      if (!handleErrors(err)) {
        resolve(data);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Reads a configuration directory at the given path
 * @param {String} path The path to the directory
 * @return {Promise<Array<String>>} An array of the directory's children
 */
function readConfDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(`${confDir}/${path}`, (err, files) => {
      if (!handleErrors(err)) {
        resolve(files);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Writes to a configuration file
 * @param {String} path The path to the file
 * @param {String} data The data to write to the file
 * @return {Promise<String>} A promise that is rejected if there is an error
 */
function writeConf(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${confDir}/${path}`, data, (err) => {
      if (!handleErrors(err)) {
        resolve(null);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Removes a configuration file
 * @param {String} path The path to the file
 * @return {Promise<String>} A promise that is rejected if there is an error
 */
function removeConf(path) {
  return new Promise((resolve, reject) => {
    fs.unlink(`${confDir}/${path}`, (err) => {
      if (!handleErrors(err)) {
        resolve(null);
      } else {
        reject(err);
      }
    });
  });
}

initFs();

module.exports = {
  readConfSync: readConfSync,
  readConfDirSync: readConfDirSync,
  writeConfSync: writeConfSync,
  removeConfSync: removeConfSync,
  readConf: readConf,
  readConfDir: readConfDir,
  writeConf: writeConf,
  removeConf: removeConf,
};
