const { remote } = require('electron')
const dev = require('electron-is-dev')
const path = require('path')

const newWindowConfig = {
  width: 1200,
  height: 800,
  titleBarStyle: 'hiddenInset',
  icon: path.join(__dirname, 'dist/assets/icons/png/64x64.png'),
  backgroundColor: '#0F202D',
}

function createNewWindow() {
  const win = new remote.BrowserWindow(newWindowConfig)
  const url = dev
    ? 'http://localhost:4040'
    : `file://${path.join(__dirname, '..', '/dist/index.html')}`

  win.loadURL(url)
}

module.exports = { newWindowConfig, createNewWindow }
