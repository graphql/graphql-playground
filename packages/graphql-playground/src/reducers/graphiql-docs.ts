import {
  ADD_STACK,
  AddStackAction,
  CHANGE_KEY_MOVE,
  CHANGE_WIDTH_DOCS,
  ChangeKeyMoveAction,
  ChangeWidthDocsAction,
  SET_STACKS,
  SetStacksAction,
  ToggleDocsAction,
  TOOGLE_DOCS,
} from '../actions/graphiql-docs'
import { columnWidth } from '../constants'
import { GraphQLField } from 'graphql'

export type GraphiqlDocsAction =
  | AddStackAction
  | ToggleDocsAction
  | ChangeWidthDocsAction
  | ChangeKeyMoveAction
  | SetStacksAction

export interface DocsState {
  [sessionId: string]: SessionState
}

export interface NavItem {
  x: number
  y: number
  field: GraphQLField<any, any>
}

export interface SessionState {
  readonly navStack: NavItem[]
  readonly docsOpen: boolean
  readonly docsWidth: number
  readonly keyMove: boolean
}

export const defaultSessionState: SessionState = {
  navStack: [],
  docsOpen: false,
  docsWidth: columnWidth,
  keyMove: false,
}

const defaultState: DocsState = {}

export default function graphiqlDocsReducer(
  state: DocsState = defaultState,
  action: GraphiqlDocsAction,
) {
  switch (action.type) {
    case SET_STACKS:
      return {
        ...state,
        [action.sessionId]: {
          ...(state[action.sessionId] || defaultSessionState),
          navStack: action.stacks,
        },
      }
    case ADD_STACK:
      const { field, x, y } = action
      let newNavStack = (state[action.sessionId] || defaultSessionState)
        .navStack
      if (!field.path) {
        field.path = field.name
      }
      // Reset the list to the level clicked
      if (x < newNavStack.length) {
        newNavStack = newNavStack.slice(0, x)
      }
      return {
        ...state,
        [action.sessionId]: {
          ...(state[action.sessionId] || defaultSessionState),
          navStack: [
            ...newNavStack,
            {
              x,
              y,
              field,
            },
          ],
        },
      }

    case TOOGLE_DOCS:
      const { open } = action
      if (open !== undefined) {
        return {
          ...state,
          docsOpen: open,
        }
      }
      return {
        ...state,
        [action.sessionId]: {
          ...(state[action.sessionId] || defaultSessionState),
          docsOpen: !state.docsOpen,
        },
      }

    case CHANGE_WIDTH_DOCS:
      const { width } = action
      return {
        ...state,
        [action.sessionId]: {
          ...(state[action.sessionId] || defaultSessionState),
          docsWidth: width,
        },
      }

    case CHANGE_KEY_MOVE:
      const { move } = action
      return {
        ...state,
        [action.sessionId]: {
          ...(state[action.sessionId] || defaultSessionState),
          keyMove: move,
        },
      }
  }
  return state
}
