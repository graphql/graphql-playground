import {
  app,
  Menu,
  BrowserWindow,
  ipcMain
} from 'electron'
import * as glob from 'globby'
import * as Bluebird from 'bluebird'
import * as fs from 'fs'
import * as dirtToJson from './dirToJson'
import * as shell from 'shelljs'

Bluebird.promisifyAll(fs)

function getTree(configDir, options) {
  return {
    data: dirtToJson(configDir, options)
  }
}

export default function files() {
  const {
    rm,
    error,
    mv,
    mkdir
  } = shell;

  // gets file data if has been double clicked via system
  ipcMain.on('get-file-data', event => {
    if (process.platform === 'win32' && process.argv.length >= 2) {
      const filePath = process.argv[1]

      fs.readFileAsync(filePath, 'utf-8')
        .then(data => {
          event.sender.send('content-loaded', {
            data
          })
        })
        .catch(error => {
          event.sender.send('content-loaded', {
            error
          })
        })
    }
  })

  // get files structure
  ipcMain.on(
    'get-file-tree',
    (event, {
      configDir,
      excludes = [],
      includes = []
    }) => {
      const options = {
        exclude: excludes,
        include: includes
      }

      event.sender.send('file-tree-changed', getTree(configDir, options))
    }
  )


  // Load file content
  ipcMain.on('load-file-content', ((event, filePath) => {
    fs.readFileAsync(filePath, 'utf-8')
      .then(data => {
        event.sender.send('content-loaded', {
          data
        })
      })
      .catch(error => {
        event.sender.send('content-loaded', {
          error
        })
      })
  }))

  // Save file
  ipcMain.on('save-file', ((event, {
    filePath,
    content
  }) => {
    return fs.writeFileAsync(filePath)
      .then(() => event.sender.send('file-saved', {}))
      .catch(error => error)
  }))

  // delete file
  ipcMain.on('delete-file', ((event, filePath) => {
    return fs.unlinkAsync(filePath)
      .then(() => event.sender.send('file-tree-changed', getTree(configDir, options)))
      .catch(error => error)
  }))

  ipcMain.on('create-folder', (event, dirPath) => {
    mkdir('-p', dirPath)

    if (error) {
      event.sender.send('file-tree-changed', {
        error
      })
    } else {
      event.sender.send('file-tree-changed', getTree(configDir, options))
    }
  })

  ipcMain.on('delete-folder', (event, dirPath) => {
    rm('-r', dirPath)

    if (error) {
      event.sender.send('file-tree-changed', {
        error
      })
    } else {
      event.sender.send('file-tree-changed', getTree(configDir, options))
    }
  })

  ipcMain.on('move-folder', (event, configDir, from, to) => {
    mv('', from, to)

    if (error) {
      event.sender.send('file-tree-changed', {
        error
      })
    } else {
      event.sender.send('file-tree-changed', getTree(configDir, options))
    }
  })
}