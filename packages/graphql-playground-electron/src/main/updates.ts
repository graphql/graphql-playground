import { app, autoUpdater, ipcMain, BrowserWindow, dialog } from 'electron'
import ms = require('ms')
import dev = require('electron-is-dev')
import * as log from 'electron-log'
import { notify } from './notify'

export const startUpdates = () => {
  if (!dev) {
    startAppUpdates()
  }
}

const setUpdateURL = async () => {
  let betaUpdates = false

  await new Promise(resolve => {
    ipcMain.once('SettingsResponse', (event, settingsString) => {
      log.info('settings', settingsString)
      betaUpdates = getBetaUpdates(settingsString)
      resolve()
    })

    send('SettingsRequest', '')
  })

  const channel = betaUpdates ? 'kygnjrcroc' : 'ppbimurjwk'
  const server = `https://hazel-server-${channel}.now.sh/update`
  autoUpdater.setFeedURL(`${server}/${process.platform}/${app.getVersion()}`)
}

const checkForUpdates = async () => {
  if (process.env.CONNECTION === 'offline') {
    // Try again after half an hour
    setTimeout(checkForUpdates, ms('30m'))
    return
  }

  // Ensure we're pulling from the correct channel
  try {
    await setUpdateURL()
  } catch (err) {
    log.error(err)
    // Retry later if setting the update URL failed
    return
  }

  // Then ask the server for updates
  autoUpdater.checkForUpdates()
}

const startAppUpdates = () => {
  autoUpdater.on('error', error => {
    log.error(error)
    setTimeout(checkForUpdates, ms('15m'))
  })

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for app updates...')
  })

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded')
    const buttonIndex = dialog.showMessageBox({
      message: `Update downlaoded. Install now?`,
      buttons: ['Install Update & Restart', 'Later'],
    })
    if (buttonIndex === 0) {
      autoUpdater.quitAndInstall()
      app.quit()
    }
  })

  autoUpdater.on('update-available', () => {
    log.info('Found update for the app! Downloading...')
    notify({
      title: 'GraphQL Playground Updates',
      body: 'Update available. Downloading...',
    })
  })

  autoUpdater.on('update-not-available', () => {
    log.info('No updates found. Checking again in 5 minutes...')
    setTimeout(checkForUpdates, ms('5m'))
  })

  setTimeout(checkForUpdates, ms('10s'))
}

function send(channel: string, arg: string) {
  const window = BrowserWindow.getAllWindows()[0]
  if (window) {
    log.info('sending to open window', channel, arg)
    window.webContents.send(channel, arg)
  } else {
    log.info('no opened window')
  }
}

function getBetaUpdates(settingsString: string | undefined): boolean {
  try {
    const settings = JSON.parse(settingsString)
    return !!settings['general.betaUpdates']
  } catch (e) {
    //
  }

  return false
}
