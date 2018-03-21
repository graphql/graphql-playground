import * as React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import GraphQLBinApp from './GraphQLBinApp'

export default class Root extends React.Component<{}, {}> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/:id" component={GraphQLBinApp} />
          <Redirect from="/" to="/new" component={GraphQLBinApp} />
        </Switch>
      </BrowserRouter>
    )
  }
}
