import { createSelector } from 'reselect'
import { defaultSettings } from './reducers'
import { getSelectedWorkspace } from '../workspace/reducers'

const makeGeneralSelector = key =>
  createSelector([getSelectedWorkspace], state => {
    return state.general.get(key)
  })

export const getFixedEndpoint = makeGeneralSelector('fixedEndpoint')
export const getHistoryOpen = makeGeneralSelector('historyOpen')
export const getSettingsString = makeGeneralSelector('settingsString')
export const getConfigString = makeGeneralSelector('configString')

export const getSettings = createSelector(
  [getSettingsString],
  (settingsString: any) => {
    try {
      return JSON.parse(settingsString)
    } catch (e) {
      return defaultSettings
    }
  },
)
