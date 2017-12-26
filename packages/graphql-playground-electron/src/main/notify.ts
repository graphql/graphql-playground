import { shell, Notification } from 'electron'

export const notify = ({ title, body, url, onClick }) => {
  const notification = new Notification({
    title,
    body,
    silent: true,
  })

  if (url || onClick) {
    notification.on('click', () => {
      if (onClick) {
        return onClick()
      }

      shell.openExternal(url)
    })
  }

  notification.show()
  console.log(`[Notification] ${title}: ${body}`)
}
