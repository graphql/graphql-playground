'use strict';

const Bluebird = require('bluebird')
const fs = require('fs')
const globToRegExp = require('glob-to-regexp');

Bluebird.promisifyAll(fs)

const fs = require('fs');
const PATH = require('path');
const constants = {
  DIRECTORY: 'directory',
  FILE: 'file'
}

function safeReadDirSync(path) {
  let dirData = {};
  try {
    dirData = fs.readdirSync(path);
  } catch (ex) {
    if (ex.code === "EACCES") {
      //User does not have permissions, ignore directory
      return null;
    } else {
      throw ex;
    }
  }
  return dirData;
}

function checkExclude(options, path) {
  if (options && options.exclude) {

    if (Array.isArray(options.exclude)) {
      return options.exclude.map(item => {
          // if not regex convert blob to regex
          const exclude = item instanceof RegExp ? item : globToRegExp(item)

          // test path string
          return exclude.test(path)
        })
        .some(t => Boolean(t))

    } else {
      // if not regex convert blob to regex
      const exclude = options.exclude instanceof RegExp ? options.exclude : globToRegExp(options.exclude)

      // test path string
      if (exclude.test(path)) {
        return true
      }
    }
  }
}

function directoryTree(path, options, onEachFile) {
  const module = PATH.basename(path);
  const item = {
    module,
    path
  };
  let stats;

  try {
    stats = fs.statSync(path);
  } catch (e) {
    return null;
  }

  // Skip if it matches the exclude regex
  if (checkExclude(options, path)) {
    return null
  }


  if (stats.isFile()) {

    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (checkExclude(options, path)) {
      return null
    }

    item.size = stats.size; // File size in bytes
    item.extension = ext;
    item.type = constants.FILE;
    item.leaf = true
    if (onEachFile) {
      onEachFile(item, PATH);
    }
  } else if (stats.isDirectory()) {
    let dirData = safeReadDirSync(path);
    if (dirData === null) {
      return null;
    }

    item.children = dirData
      .map(child => directoryTree(PATH.join(path, child), options, onEachFile))
      .filter(e => !!e);
    item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
    item.type = constants.DIRECTORY;
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}

module.exports = directoryTree;