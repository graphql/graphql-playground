import { GraphQLField } from 'graphql'
import { Map, List, Record } from 'immutable'
import { handleActions } from 'redux-actions'
import { columnWidth } from '../../constants'

export type DocsState = Map<string, DocsSessionState>

export interface NavItem {
  x: number
  y: number
  field: GraphQLField<any, any>
}

export interface DocsSessionState {
  readonly navStack: List<Map<string, NavItem>>
  readonly docsOpen: boolean
  readonly docsWidth: number
  readonly keyMove: boolean
}

export const DocsSession = Record<DocsSessionState>({
  navStack: List([]),
  docsOpen: false,
  docsWidth: columnWidth,
  keyMove: false,
})

const defaultState: DocsState = Map({ '': new DocsSession() })

export default handleActions(
  {
    SET_STACKS: (state, { payload: { sessionId, stacks } }) => {
      let session = getSession(state, sessionId)
      session = session.set('navStack', stacks)
      return state.set(sessionId, session)
    },
    ADD_STACK: (state, { payload: { sessionId, field, x, y } }) => {
      if (!field.path) {
        field.path = field.name
      }
      let session = getSession(state, sessionId)
      session = session.update('navStack', navStack => {
        let newNavStack = navStack
        if (x < newNavStack.count()) {
          newNavStack = newNavStack.slice(0, x)
        }
        return newNavStack.push(
          Map({
            x,
            y,
            field,
          }),
        )
      })
      return state.set(sessionId, session)
    },
    TOGGLE_DOCS: (state, { payload: { sessionId } }) => {
      let session = getSession(state, sessionId)
      session = session.set('docsOpen', !session.docsOpen)
      return state.set(sessionId, session)
    },
    SET_DOCS_VISIBLE: (state, { payload: { sessionId, open } }) => {
      let session = getSession(state, sessionId)
      session = session.set('docsOpen', !!open)
      return state.set(sessionId, session)
    },
    CHANGE_WIDTH_DOCS: (state, { payload: { sessionId, width } }) => {
      let session = getSession(state, sessionId)
      session = session.set('docsWidth', width)
      return state.set(sessionId, session)
    },
    CHANGE_KEY_MOVE: (state, { payload: { sessionId, keyMove } }) => {
      let session = getSession(state, sessionId)
      session = session.set('keyMove', keyMove)
      return state.set(sessionId, session)
    },
  },
  defaultState,
)

function getSession(state, sessionId) {
  if (!sessionId) {
    throw new Error('sessionId cant be null')
  }
  return state.get(sessionId) || new DocsSession()
}
