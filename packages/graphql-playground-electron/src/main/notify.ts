import { shell, Notification } from 'electron'

interface NotificationOptions {
  title: string
  body: string
  url?: string
  onClick?: () => void
}

export const notify = ({ title, body, url, onClick }: NotificationOptions) => {
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
