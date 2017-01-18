import * as React from 'react'
import {CustomGraphiQL} from './GraphiQL/CustomGraphiQL'
import * as fetch from 'isomorphic-fetch'
import {
  buildClientSchema,
} from 'graphql'

const simpleEndpoint = 'https://api.graph.cool/simple/v1/ciwkuhq2s0dbf0131rcb3isiq'
const relayEndpoint = 'https://api.graph.cool/relay/v1/ciwkuhq2s0dbf0131rcb3isiq'

export type Endpoint = 'SIMPLE' | 'RELAY'
export type Viewer = 'ADMIN' | 'EVERYONE' | 'USER'

interface State {
  selectedEndpoint: Endpoint
  selectedViewer: Viewer
  schema: any
}

export default class Playground extends React.Component<null,State> {
  constructor(props) {
    super(props)

    this.state = {
      selectedEndpoint: 'SIMPLE',
      schema: null,
      selectedViewer: 'ADMIN',
    }
  }
  componentWillMount() {
    this.fetchSchema()
  }
  fetchSchema() {
    const endpoint = this.getEndpoint()
    return fetch(endpoint, { // tslint:disable-line
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': this.state.selectedUserId === GUEST.id ?
        //   '' :
        //   `Bearer ${this.state.selectedUserToken || this.state.adminToken}`,
      },
      body: JSON.stringify({query: introspectionQuery}),
    })
    .then((response) => {
      return response.json()
    })
    .then(res => {
      this.setState({
        schema: buildClientSchema(res.data),
      } as State)
    })
  }
  render() {
    return (
      <div className='root'>
        <style jsx>{`
          .root {
            @inherit: .h100;
          }
        `}</style>
        <CustomGraphiQL
          schema={this.state.schema}
          fetcher={this.fetcher}
          selectedEndpoint={this.state.selectedEndpoint}
          onChangeEndpoint={this.handleEndpointChange}
          showViewAs={true}
          selectedViewer={this.state.selectedViewer}
          onChangeViewer={this.handleViewerChange}
        />
      </div>
    )
  }

  private handleViewerChange = (viewer: Viewer) => {
    this.setState({selectedViewer: viewer} as State)
  }

  private handleEndpointChange = (endpoint: Endpoint) => {
    this.setState({selectedEndpoint: endpoint} as State, this.fetchSchema)
  }

  private getEndpoint() {
    return this.state.selectedEndpoint === 'SIMPLE' ? simpleEndpoint : relayEndpoint
  }

  private fetcher = (graphQLParams) => {
    const endpoint = this.getEndpoint()

    return fetch(endpoint, { // tslint:disable-line
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

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`