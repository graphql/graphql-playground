import { remote } from 'electron'
import * as dev from 'electron-is-dev'
import * as path from 'path'

export const newWindowConfig: Electron.BrowserWindowConstructorOptions = {
  title: 'GraphQL Playground',
  width: 1200,
  height: 800,
  titleBarStyle: 'hidden-inset',
  icon: path.join(__dirname, '../static/icons/icon.icns'),
  backgroundColor: '#0F202D',
}

export function createNewWindow() {
  const win = new remote.BrowserWindow(newWindowConfig)
  const url = dev
    ? 'http://localhost:4040'
    : `file://${path.join(__dirname, '..', '/dist/index.html')}`

  win.loadURL(url)
}
