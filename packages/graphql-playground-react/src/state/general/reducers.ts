import { Map } from 'immutable'
import { handleActions } from 'redux-actions'

export interface GeneralState {
  historyOpen: boolean
  fixedEndpoint: boolean
}

const defaultSessionDocsState: GeneralState = {
  historyOpen: false,
  fixedEndpoint: false,
}

const defaultState: Map<string, any> = Map(defaultSessionDocsState)

export default handleActions(
  {
    SET_HISTORY_OPEN: (state, { open }) => state.set('historyOpen', open),
    SET_ENDPOINT_DISABLED: (state, { value }) =>
      state.set('endpointDisabled', value),
  },
  defaultState,
)
