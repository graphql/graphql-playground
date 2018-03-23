import * as React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import GraphQLBinApp from './GraphQLBinApp'

export default class Root extends React.Component<{}, {}> {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/v2/:id" component={GraphQLBinApp} />
          <Redirect from="/" to="/v2/new" component={GraphQLBinApp} />
        </Switch>
      </BrowserRouter>
    )
  }
}
