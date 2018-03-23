import * as React from 'react'
import App from './App'
import { store } from 'graphql-playground-react'
import { Provider } from 'react-redux'

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}
