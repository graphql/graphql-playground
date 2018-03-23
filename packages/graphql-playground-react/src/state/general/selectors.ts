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
      return normalizeSettings(JSON.parse(settingsString))
    } catch (e) {
      return defaultSettings
    }
  },
)

function normalizeSettings(settings) {
  const theme = settings['editor.theme']
  if (theme !== 'dark' && theme !== 'light') {
    settings['editor.theme'] = 'dark'
  }

  return settings
}

export const getTheme = createSelector([getSettings], s => s.theme || 'dark')
