import { Record } from 'immutable'
import { handleActions } from 'redux-actions'

const GeneralStateRecord = Record({
  historyOpen: false,
  fixedEndpoint: false,
  endpoint: '',
  configString: '',
  envVars: {}
})

export class GeneralState extends GeneralStateRecord {}

export default handleActions(
  {
    OPEN_HISTORY: state => state.set('historyOpen', true),
    CLOSE_HISTORY: state => state.set('historyOpen', false),
    SET_ENDPOINT_DISABLED: (state, { payload: { value } }) =>
      state.set('endpointDisabled', value),
    SET_CONFIG_STRING: (state, { payload: { configString } }) =>
      state.set('configString', configString)
  },
  new GeneralState()
)
