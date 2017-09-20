'use strict';

import * as Bluebird from 'bluebird'
import * as fs from 'fs'
import * as globToRegExp from 'glob-to-regexp'
import * as path from 'path'

Bluebird.promisifyAll(fs)

const constants = {
  DIRECTORY: 'directory',
  FILE: 'file'
}

function safeReadDirSync(filePath) {
  let dirData = [];
  try {
    dirData = fs.readdirSync(filePath);
  } catch (ex) {
    if (ex.code === "EACCES") {
      // User does not have permissions, ignore directory
      return null;
    } else {
      throw ex;
    }
  }
  return dirData;
}

function checkExclude(options, filePath) {
  if (options && options.exclude) {

    if (Array.isArray(options.exclude)) {
      return options.exclude.map(item => {
        // if not regex convert blob to regex
        const exclude = item instanceof RegExp ? item : globToRegExp(item)

        // test filePath string
        return exclude.test(filePath)
      })
        .some(t => Boolean(t))

    } else {
      // if not regex convert blob to regex
      const exclude = options.exclude instanceof RegExp ? options.exclude : globToRegExp(options.exclude)

      // test filePath string
      if (exclude.test(filePath)) {
        return true
      }
    }
  }
}

function directoryTree(filePath, options, onEachFile) {
  const module = path.basename(filePath);
  console.log(filePath)

  const item = {
    module,
    filePath,
    size: null,
    extension: null,
    type: null,
    leaf: null,
    children: null
  }

  let stats;

  try {
    stats = fs.statSync(filePath);
  } catch (e) {
    return null;
  }

  // Skip if it matches the exclude regex
  if (checkExclude(options, filePath)) {
    return null
  }


  if (stats.isFile()) {

    const ext = path.extname(filePath).toLowerCase();

    // Skip if it does not match the extension regex
    if (checkExclude(options, filePath)) {
      return null
    }

    item.size = stats.size; // File size in bytes
    item.extension = ext;
    item.type = constants.FILE;
    item.leaf = true
    if (onEachFile) {
      onEachFile(item, path);
    }
  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(filePath);
    if (dirData === null) {
      return null;
    }

    item.children = dirData
      .map(child => directoryTree(path.join(filePath, child), options, onEachFile))
      .filter(e => !!e);
    item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
    item.type = constants.DIRECTORY;
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}

export default directoryTree;