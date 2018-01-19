export default function ageOfDate(date: Date) {
  const now = new Date()
  const diffMs = Math.abs(date.getTime() - now.getTime())
  const diffDays = Math.floor(diffMs / 86400000)
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000)
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000)

  if (diffDays > 0) {
    return `${diffDays} days ago`
  }

  if (diffHrs > 0) {
    return `${diffHrs} h ago`
  }

  if (diffMins > 0) {
    return `${diffMins} min ago`
  }

  const sec = Math.round(diffMs / 1000)

  return `${sec} sec${sec > 1 ? 's' : ''} ago`
}
