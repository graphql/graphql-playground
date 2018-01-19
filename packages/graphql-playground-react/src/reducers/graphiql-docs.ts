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
  const oldSessionState = state[action.sessionId] || defaultSessionState
  switch (action.type) {
    case SET_STACKS:
      return {
        ...state,
        [action.sessionId]: {
          ...oldSessionState,
          navStack: action.stacks,
        },
      }
    case ADD_STACK:
      const { field, x, y } = action
      let newNavStack = oldSessionState.navStack
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
          ...oldSessionState,
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
          [action.sessionId]: {
            ...oldSessionState,
            docsOpen: open,
          },
        }
      }

      const newState = {
        ...state,
        [action.sessionId]: {
          ...oldSessionState,
          docsOpen: !oldSessionState.docsOpen,
        },
      }

      return newState

    case CHANGE_WIDTH_DOCS:
      const { width } = action
      return {
        ...state,
        [action.sessionId]: {
          ...oldSessionState,
          docsWidth: width,
        },
      }

    case CHANGE_KEY_MOVE:
      const { move } = action
      return {
        ...state,
        [action.sessionId]: {
          ...oldSessionState,
          keyMove: move,
        },
      }
  }
  return state
}
