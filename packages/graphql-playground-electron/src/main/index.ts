// TODO enable tslint
// /* tslint:disable */
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  protocol,
  Menu,
} from 'electron'
import * as queryString from 'query-string'
import * as fs from 'fs'
import * as log from 'electron-log'
import { buildTemplate } from './menu'
import { createWindow } from './createWindow'
import { WindowContext } from './types'
import { startUpdates } from './updates'
import squirrelStartup = require('electron-squirrel-startup')
import * as Raven from 'raven'
Raven.config(
  'https://cce868d3730e473e9350f1436da7d908:ff5d65389e404b28b5af1d97d8024414@sentry.io/297194',
).install()

log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// Immediately quit the app if squirrel is launching it
if (squirrelStartup) {
  app.quit()
}

const windowContext: WindowContext = {
  readyWindowsPromises: {},
  windows: new Set(),
  windowById: new Map(),
  windowByPath: new Map(),
}

let appResolve
const appPromise = new Promise(resolve => (appResolve = resolve))

app.setAsDefaultProtocolClient('graphql-playground')

app.on('open-url', (event, url) => {
  event.preventDefault()

  const cutIndex = url.indexOf('//')
  const query = url.slice(cutIndex + 2)
  const input = queryString.parse(query)
  let env
  if (input.env) {
    try {
      env = JSON.parse(input.env)
    } catch (e) {
      // could
      console.log('could not get env')
    }
  }
  if (input.envPath) {
    try {
      env = JSON.parse(fs.readFileSync(input.envPath, 'utf-8'))
      fs.unlinkSync(input.envPath)
    } catch (e) {
      //
    }
  }
  const msg = JSON.stringify({
    ...input,
    env,
  })
  forceSend('OpenUrl', msg, input.cwd)
})

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  forceSend('OpenSelectedFile', filePath, filePath)
})

ipcMain.on('online-status-changed', (event, status) => {
  process.env.CONNECTION = status
})

ipcMain.on('async', (event, arg) => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.close()
  }
})

ipcMain.on('cwd', (event, msg) => {
  const { cwd, id } = JSON.parse(msg)
  const window = windowContext.windowById.get(id)
  windowContext.windowByPath.set(cwd, window)
})

ipcMain.on('CloseWindow', (event, msg) => {
  const { id } = JSON.parse(msg)
  const window = windowContext.windowById.get(id)
  window.close()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow(windowContext)

  startUpdates()

  const menu = Menu.buildFromTemplate(buildTemplate(windowContext))
  Menu.setApplicationMenu(menu)

  ipcMain.on('get-file-data', event => {
    log.info('get-file-data', event)
    // this.fileAdded(event)
  })

  ipcMain.on('load-file-content', (event, filePath) => {
    log.info('load-file-content', event, filePath)
  })

  protocol.registerFileProtocol('file:', (request, filePath) => {
    log.info('file:', request, filePath)
  })

  if (appResolve) {
    appResolve()
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(windowContext)
  }
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

async function forceSend(channel: string, arg: string, byPath?: string) {
  await appPromise

  const currentWindows = BrowserWindow.getAllWindows()
  let window
  if (byPath) {
    window = windowContext.windowByPath.get(byPath)
    if (
      !window &&
      currentWindows.length === 1 &&
      windowContext.windowByPath.size === 0
    ) {
      window = currentWindows[0]
    }
  } else {
    window = currentWindows[0]
  }
  let destroyed = null
  try {
    destroyed = window ? window.isDestroyed() : null
  } catch (e) {
    //
  }
  if (!window || destroyed) {
    window = createWindow(windowContext)
  }
  await windowContext.readyWindowsPromises[window.id]
  window.webContents.send(channel, arg)
}
