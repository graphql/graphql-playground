import { FILES, SetFilesAction, Files } from '../actions/files'

export interface State {
  readonly files: Files[]
}

const defaultState: State = {
  files: []
}

export default function filesReducer(
  state: State = defaultState,
  action: SetFilesAction
): State {
  switch (action.type) {
    case FILES:
      return {
        ...state,
        files: action.files
      }
  }
  return state
}
