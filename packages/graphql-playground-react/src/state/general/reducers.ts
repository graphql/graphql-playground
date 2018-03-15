import { Record } from 'immutable'
import { handleActions } from 'redux-actions'

export interface GeneralStateType {
  historyOpen: boolean
  fixedEndpoint: boolean
  endpoint: string
  settingsString: string
  configString: string
  envVars: any
}

export const GeneralState = Record<GeneralStateType>({
  historyOpen: false,
  fixedEndpoint: false,
  endpoint: '',
  settingsString: '',
  configString: '',
  envVars: {},
})

export default handleActions(
  {
    OPEN_HISTORY: state => state.set('historyOpen', true),
    CLOSE_HISTORY: state => state.set('historyOpen', false),
    SET_ENDPOINT_DISABLED: (state, { payload: { value } }) =>
      state.set('endpointDisabled', value),
    SET_CONFIG_STRING: (state, { payload: { configString } }) =>
      state.set('configString', configString),
    SET_SETTINGS_STRING: (state, { payload: { settingsString } }) =>
      state.set('settingsString', settingsString),
  },
  new GeneralState(),
)

export const defaultSettings = {
  'general.betaUpdates': false,
  'editor.theme': 'dark',
  'editor.reuseHeaders': true,
  'request.credentials': 'omit',
  'tracing.hideTracingResponse': true,
}
