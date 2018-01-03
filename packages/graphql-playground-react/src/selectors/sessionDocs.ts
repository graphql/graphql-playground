import { defaultSessionState } from '../reducers/graphiql-docs'

export const getSessionDocs = ({ graphiqlDocs }, { sessionId }) => {
  const docs = graphiqlDocs[sessionId]
  if (docs) {
    return {
      navStack: docs.navStack,
      docsOpen: docs.docsOpen,
      docsWidth: docs.docsWidth,
      keyMove: docs.keyMove,
    }
  } else {
    return defaultSessionState
  }
}
