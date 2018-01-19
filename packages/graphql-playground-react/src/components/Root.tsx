import * as React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import App from './App'

export default class Root extends React.Component<{}, {}> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/:id" component={App} />
          <Redirect from="/" to="/new" component={App} />
        </Switch>
      </BrowserRouter>
    )
  }
}
