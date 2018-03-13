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

const defaultState: DocsState = Map({})

export default handleActions(
  {
    SET_STACKS: (state, { sessionId, stacks }) =>
      state.setIn([sessionId, 'navStack'], stacks),
    ADD_STACK: (state, { sessionId, field, x, y }) => {
      if (!field.path) {
        field.path = field.name
      }
      return state.updateIn([sessionId, 'navStack'], navStack => {
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
    },
    TOGGLE_DOCS: (state, { sessionId, open }) =>
      state.setIn(
        [sessionId, 'open'],
        typeof open === 'undefined' ? !state.getIn([sessionId, 'open']) : open,
      ),
    CHANGE_WIDTH_DOCS: (state, { sessionId, width }) =>
      state.setIn([sessionId, 'width'], width),
    CHANGE_KEY_MOVE: (state, { sessionId, keyMove }) =>
      state.setIn([sessionId, 'keyMove'], keyMove),
  },
  defaultState,
)
