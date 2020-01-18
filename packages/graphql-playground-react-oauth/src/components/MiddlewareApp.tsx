import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../state/createStore'
import { getSettings } from '../state/workspace/reducers'
import { setSettingsString } from '../state/general/actions'
import PlaygroundWrapper, { PlaygroundWrapperProps } from './PlaygroundWrapper'

const store = createStore()

export default class MiddlewareApp extends React.Component<
  PlaygroundWrapperProps
> {
  componentDidMount() {
    const initialSettings = getSettings(store.getState())
    const mergedSettings = { ...initialSettings, ...this.props.settings }
    const settingsString = JSON.stringify(mergedSettings, null, 2)
    store.dispatch(setSettingsString(settingsString))
  }
  render() {
    return (
      <Provider store={store}>
        <PlaygroundWrapper {...this.props} />
      </Provider>
    )
  }
}
