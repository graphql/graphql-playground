import {
  MenuItemConstructorOptions,
  BrowserWindow,
  app,
  dialog,
} from 'electron'
import { autoUpdater } from 'electron-updater'
import { log } from '../shared/utils'
import { WindowContext } from './types'
import { createWindow } from './createWindow'

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
        click: async () => {
          const { updateInfo, downloadPromise } = await autoUpdater.checkForUpdates()
          if (updateInfo.version !== autoUpdater.currentVersion) {
            const buttonIndex = dialog.showMessageBox({
              message: `New version available: ${updateInfo.version}`,
              buttons: ['Install Update', 'Later'],
            })
            if (buttonIndex === 0) {
              await downloadPromise
              autoUpdater.quitAndInstall()
            }
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Settings',
        accelerator: 'Command+,',
        click: () => send('Tab', 'Settings'),
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => app.quit(),
      },
    ],
  },
  {
    label: 'Workspace',
    submenu: [
      {
        label: 'New Workspace',
        accelerator: 'Cmd+N',
        click: () => {
          createWindow(windowContext)
        },
      },
      {
        label: 'New Tab',
        accelerator: 'Cmd+T',
        click: () => send('Tab', 'New'),
      },
      { type: 'separator' },
      {
        label: 'Close Workspace',
        accelerator: 'Cmd+Shift+W',
        role: 'close',
      },
      {
        label: 'Close Tab',
        accelerator: 'Cmd+W',
        click: () => send('Tab', 'Close'),
      },
      {
        label: 'Open File',
        accelerator: 'Cmd+O',
        click: () => send('File', 'Open'),
      },
      {
        label: 'Save File',
        accelerator: 'Cmd+S',
        click: () => send('File', 'Save'),
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
        accelerator: 'Cmd+Alt+Right',
        click: () => send('Tab', 'Next'),
      },
      {
        label: 'Previous Tab',
        accelerator: 'Cmd+Alt+Left',
        click: () => send('Tab', 'Next'),
      },
      {
        label: 'Minimize',
        accelerator: 'Cmd+M',
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
