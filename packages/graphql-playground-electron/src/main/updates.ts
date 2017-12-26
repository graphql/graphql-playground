import { app, autoUpdater } from 'electron'
import ms = require('ms')
import dev = require('electron-is-dev')

const setUpdateURL = () => {
  const server = 'https://hazel-server-ppbimurjwk.now.sh/update'
  autoUpdater.setFeedURL(`${server}/${process.platform}/${app.getVersion()}`)
}

const checkForUpdates = () => {
  if (process.env.CONNECTION === 'offline') {
    // Try again after half an hour
    setTimeout(checkForUpdates, ms('30m'))
    return
  }

  // Ensure we're pulling from the correct channel
  try {
    setUpdateURL()
  } catch (err) {
    // Retry later if setting the update URL failed
    return
  }

  // Then ask the server for updates
  autoUpdater.checkForUpdates()
}

const startAppUpdates = () => {
  autoUpdater.on('error', error => {
    // Report errors to console. We can't report
    // to Slack and restart here, because it will
    // cause the app to never start again
    console.error(error)

    // Then check again for update after 15 minutes
    setTimeout(checkForUpdates, ms('15m'))
  })

  // Check for app update after startup
  setTimeout(checkForUpdates, ms('10s'))

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
    app.quit()
  })

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for app updates...')
  })

  autoUpdater.on('update-available', () => {
    console.log('Found update for the app! Downloading...')
  })

  autoUpdater.on('update-not-available', () => {
    console.log('No updates found. Checking again in 5 minutes...')
    setTimeout(checkForUpdates, ms('5m'))
  })
}

export const startUpdates = () => {
  if (process.platform === 'linux') {
    return
  }

  if (!dev) {
    startAppUpdates()
  }
}
