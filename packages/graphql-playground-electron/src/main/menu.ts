import {
  MenuItemConstructorOptions,
  BrowserWindow,
  app,
  autoUpdater,
} from 'electron'
import * as log from 'electron-log'
import { WindowContext } from './types'
import { createWindow } from './createWindow'
import { notify } from './notify'

export const buildTemplate = (
  windowContext: WindowContext,
): MenuItemConstructorOptions[] => [
  {
    label: 'Application',
    submenu: [
      {
        label: 'About GraphQL Playground',
        selector: 'orderFrontStandardAboutPanel:',
      } as MenuItemConstructorOptions,
      {
        label: 'Check For Updates',
        click: () => {
          autoUpdater.once('update-not-available', () => {
            notify({
              title: 'GraphQL Playground Updates',
              body: 'Already up to date.',
            })
          })

          autoUpdater.checkForUpdates()
        },
      },
      { type: 'separator' },
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => send('Tab', 'Settings'),
      },
      { type: 'separator' },
      {
        label: 'Hide GraphQL Playground',
        accelerator: 'Cmd+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Option+Cmd+H',
        role: 'hideOthers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      { type: 'separator', visible: process.platform === 'darwin' },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit(),
      },
    ],
  },
  {
    label: 'Workspace',
    submenu: [
      {
        label: 'New Workspace',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          createWindow(windowContext)
        },
      },
      {
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
        click: () => send('Tab', 'New'),
      },
      { type: 'separator' },
      {
        label: 'Close Workspace',
        accelerator: 'CmdOrCtrl+Shift+W',
        role: 'close',
      },
      {
        label: 'Close Tab',
        accelerator: 'CmdOrCtrl+W',
        click: () => send('Tab', 'Close'),
      },
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => send('File', 'Open'),
      },
      {
        label: 'Save File',
        accelerator: 'CmdOrCtrl+S',
        click: () => send('File', 'Save'),
      },
      {
        label: 'Reload Schema',
        accelerator: 'CmdOrCtrl+R',
        click: () => send('Tab', 'ReloadSchema'),
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:',
      } as MenuItemConstructorOptions,
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:',
      } as MenuItemConstructorOptions,
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:',
      } as MenuItemConstructorOptions,
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:',
      } as MenuItemConstructorOptions,
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:',
      } as MenuItemConstructorOptions,
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:',
      } as MenuItemConstructorOptions,
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Next Tab',
        accelerator: 'CmdOrCtrl+Alt+Right',
        click: () => send('Tab', 'Next'),
      },
      {
        label: 'Previous Tab',
        accelerator: 'CmdOrCtrl+Alt+Left',
        click: () => send('Tab', 'Next'),
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow()
          if (focusedWindow) {
            focusedWindow.minimize()
          }
        },
      },
      { type: 'separator' },
      { label: 'Toggle Developer Tools', role: 'toggledevtools' },
    ],
  },
]

function send(channel: string, arg: string) {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    log.info('sending to focused window', channel, arg)
    focusedWindow.webContents.send(channel, arg)
  } else {
    log.info('no focused window')
  }
}
