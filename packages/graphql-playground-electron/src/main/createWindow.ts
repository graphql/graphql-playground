import { BrowserWindow, app, ipcMain } from 'electron'
import * as path from 'path'
import dev = require('electron-is-dev')
import { newWindowConfig, log } from '../shared/utils'
import { WindowContext } from './types'

export function createWindow(windowContext: WindowContext) {
  // Create the browser window.
  const newWindow = new BrowserWindow(newWindowConfig)

  newWindow.loadURL(
    dev
      ? 'http://localhost:4040' // Dev server ran by react-scripts
      : `file://${path.join(__dirname, '..', '/dist/index.html')}`, // Bundled application
  )

  if (dev) {
    // If dev mode install react and redux extension
    // Also open the devtools
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
    } = require('electron-devtools-installer')

    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => log.info(`Added Extension:  ${name}`))
      .catch(err => log.info('An error occurred: ', err))

    installExtension(REDUX_DEVTOOLS)
      .then(name => log.info(`Added Extension:  ${name}`))
      .catch(err => log.info('An error occurred: ', err))

    // newWindow.webContents.openDevTools()
  }

  windowContext.windows.add(newWindow)
  windowContext.windowById.set(newWindow.id, newWindow)

  // Emitted when the window is closed.
  const id = newWindow.id
  newWindow.on('closed', () => {
    if (process.platform !== 'darwin' && windowContext.windows.size === 0) {
      app.quit()
    }
    windowContext.windows.delete(newWindow)
    windowContext.windowById.delete(id)
    windowContext.windowByPath.forEach((window, cwd) => {
      if (window === newWindow) {
        windowContext.windowByPath.delete(cwd)
      }
    })
  })

  // electronLocalShortcut.register(newWindow, 'Cmd+Shift+]', () => {
  //   send('Tab', 'Next')
  // })

  // electronLocalShortcut.register(newWindow, 'Cmd+Shift+[', () => {
  //   send('Tab', 'Prev')
  // })

  windowContext.readyWindowsPromises[newWindow.id] = new Promise(resolve =>
    ipcMain.once('ready', resolve),
  )

  return newWindow
}
