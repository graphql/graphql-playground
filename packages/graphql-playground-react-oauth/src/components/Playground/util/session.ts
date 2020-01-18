import { Session } from '../../../state/sessions/reducers'

export function isSharingAuthorization(sharableSessions: Session[]): boolean {
  // If user's gonna share an Authorization header,
  // let's warn her

  // Check all sessions
  for (const session of sharableSessions) {
    // Check every header of each session
    for (const header of Object.keys(session.headers || {})) {
      // If there's a Authorization header present,
      // set the flag to `true` and stop the loop
      if (header.toLowerCase() === 'authorization') {
        // break
        return true
      }
    }
  }

  return false
}
