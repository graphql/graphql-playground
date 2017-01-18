import * as React from 'react'
import {CustomGraphiQL} from './GraphiQL/CustomGraphiQL'
import * as fetch from 'isomorphic-fetch'

const ENDPOINT = 'https://api.graph.cool/simple/v1/ciwkuhq2s0dbf0131rcb3isiq'

export default class Playground extends React.Component<null,null> {
  render() {
    return (
      <div className='root'>
        <style jsx>{`
          .root {
            @inherit: .h100;
          }
        `}</style>
        <CustomGraphiQL fetcher={this.fetcher} />
      </div>
    )
  }

  private fetcher = (graphQLParams) => {
    return fetch(ENDPOINT, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': this.state.selectedUserId === GUEST.id ?
        //   '' :
        //   `Bearer ${this.state.selectedUserToken || this.state.adminToken}`,
      },
      body: JSON.stringify(graphQLParams),
    })
      .then((response) => {

        return response.json()

      })
  }
}