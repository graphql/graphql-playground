import * as React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import App from './App'

interface Props {
  endpoint?: string
}

export default class Root extends React.Component<Props, {}> {
  render() {
    const renderApp = props => <App {...props} endpoint={this.props.endpoint} />
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/:id" render={renderApp} />
          <Redirect from="/" to="/new" render={renderApp} />
        </Switch>
      </BrowserRouter>
    )
  }
}
