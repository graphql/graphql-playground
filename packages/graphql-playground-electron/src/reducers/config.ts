import { CONFIG, SetConfigAction, Config } from '../actions/files'

export interface State {
  readonly config: Config
}

const defaultState: State = {
  config: {
    configDir :'',
    includes: [],
    excludes: [],
    schemePath: ''
  }
}

export default function filesReducer(
  state: State = defaultState,
  action: SetConfigAction
): State {
  switch (action.type) {
    case CONFIG:
      return {
        ...state,
        config: action.config
      }
  }
  return state
}
