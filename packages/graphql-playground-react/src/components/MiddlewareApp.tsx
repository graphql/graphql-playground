import * as React from 'react'
import { Provider } from 'react-redux'
import createStore from '../state/createStore'
import PlaygroundWrapper, { PlaygroundWrapperProps } from './PlaygroundWrapper'

const store = createStore()

export default class MiddlewareApp extends React.Component<
  PlaygroundWrapperProps
> {
  render() {
    return (
      <Provider store={store}>
        <PlaygroundWrapper {...this.props} />
      </Provider>
    )
  }
}
