import { createActions } from 'redux-actions'

export const {
  setSettingsString,
  setConfigString,
  openHistory,
  closeHistory,
} = createActions({
  SET_SETTINGS_STRING: settingsString => ({ settingsString }),
  SET_CONFIG_STRING: configString => ({ configString }),
  OPEN_HISTORY: () => ({}),
  CLOSE_HISTORY: () => ({}),
})
