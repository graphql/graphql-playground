// TODO enable tslint
/* tslint:disable */
import { app, Menu, BrowserWindow } from 'electron'
const dev = require('electron-is-dev')

const path = require('path')

const { newWindowConfig } = require('./utils')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow(newWindowConfig)

  mainWindow.loadURL(
    dev
      ? 'http://localhost:4040' // Dev server ran by react-scripts
      : `file://${path.join(__dirname, '/dist/index.html')}`, // Bundled application
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
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))

    installExtension(REDUX_DEVTOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err))

    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  // TODO use proper typing, maybe we need to update to electron 1.7.1 as they fixed some ts definitions
  // https://github.com/electron/electron/releases/tag/v1.7.1
  const template: any = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'About GraphQL Playground',
          selector: 'orderFrontStandardAboutPanel:',
        },
        {
          label: 'New window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const win = new BrowserWindow(newWindowConfig)
            win.loadURL(
              dev
                ? 'http://localhost:4040'
                : `file://${path.join(__dirname, '/dist/index.html')}`,
            )
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:',
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Close Window', accelerator: 'CmdOrCtrl+W' },
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M' },
        { type: 'separator' },
        { label: 'Toggle Developer Tools', role: 'toggledevtools' },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
  if (mainWindow === null) {
    createWindow()
  }
})
