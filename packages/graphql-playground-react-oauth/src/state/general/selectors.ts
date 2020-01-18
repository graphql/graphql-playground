const makeGeneralSelector = key => state => {
  return state.general.get(key)
}

export const getFixedEndpoint = makeGeneralSelector('fixedEndpoint')
export const getHistoryOpen = makeGeneralSelector('historyOpen')
export const getConfigString = makeGeneralSelector('configString')
