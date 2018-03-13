import * as cuid from 'cuid'
import { getQueryTypes } from './components/Playground/util/getQueryTypes'
import { Session } from './types'
import { List, Map } from 'immutable'

export const columnWidth = 300

export const introspectionQuery = `
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

export const defaultQuery = '# Try to write your query here\n'

export const modalStyle = {
  overlay: {
    zIndex: 99999,
    backgroundColor: 'rgba(15,32,46,.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'relative',
    width: 976,
    height: 'auto',
    top: 'initial',
    left: 'initial',
    right: 'initial',
    bottom: 'initial',
    borderRadius: 2,
    padding: 0,
    border: 'none',
    background: 'none',
    boxShadow: '0 1px 7px rgba(0,0,0,.2)',
  },
}

export function getDefaultSession(endpoint: string): Session {
  return {
    id: cuid(),
    query: defaultQuery,
    variables: '',
    responses: List([]),
    endpoint,
    operationName: undefined,
    hasMutation: false,
    hasSubscription: false,
    hasQuery: false,
    queryTypes: getQueryTypes(defaultQuery),
    subscriptionActive: false,
    date: new Date(),
    starred: false,
    queryRunning: false,
    operations: List([]),
    isReloadingSchema: false,
    responseExtensions: {},
    queryVariablesActive: false,
    endpointUnreachable: false,
    editorFlex: 1,
    variableEditorOpen: false,
    variableEditorHeight: 200,
    responseTracingOpen: false,
    responseTracingHeight: 300,
    docExplorerWidth: 350,
    variableToType: Map({}),
  }
}
