import * as React from 'react'
import { Provider, connect } from 'react-redux'
import createStore from '../state/createStore'
import 'isomorphic-fetch'
import { styled } from '../styled'
import { Store } from 'redux'
import PlaygroundWrapper from './PlaygroundWrapper'
import { injectState } from '../state/workspace/actions'

export const store: Store<any> = createStore()

function getParameterByName(name: string): string {
  const url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regexa = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regexa.exec(url)
  if (!results || !results[2]) {
    return ''
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export interface Props {
  endpoint?: string
  subscriptionEndpoint?: string
  history?: any
  match?: any
  headers?: any
  selectedEnvironment?: 'Development' | 'Production'
}

export interface State {
  endpoint?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  loading: boolean
  headers: any
  selectedEnvironment?: 'Development' | 'Production'
}

export interface ReduxProps {
  injectState: (state: any) => void
}

class GraphQLBinApp extends React.Component<Props & ReduxProps, State> {
  constructor(props: Props & ReduxProps) {
    super(props)

    this.state = {
      endpoint: props.endpoint,
      subscriptionEndpoint: props.subscriptionEndpoint,
      loading: false,
      headers: props.headers || {},
      selectedEnvironment: 'Development',
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.match.params.id) {
      if (this.props.match.params.id === 'new') {
        return
      }
      this.setState({ loading: true })

      // DOM side-effect:
      // #loading-wrapper is a hardcoded DOM element in the HTML entrypoint
      const loadingWrapper = document.getElementById('loading-wrapper')

      if (loadingWrapper) {
        loadingWrapper.classList.remove('fadeOut')
      }

      setTimeout(() => {
        if (loadingWrapper) {
          loadingWrapper.remove()
        }
      }, 1000)

      fetch('https://api.graphqlbin.com', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($id: String!) {
              session(id: $id) {
                data
                endpoint
              }
            }
          `,
          variables: { id: this.props.match.params.id },
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (loadingWrapper) {
            loadingWrapper.classList.add('fadeOut')
          }

          if (!res.data || res.data.session === null) {
            location.href = `${location.origin}/v2/new`
          }
          const state = JSON.parse(res.data.session.data)
          this.props.injectState(state)
          this.setState({
            endpoint: res.data.session.endpoint,
            loading: false,
          })
        })
    }
  }

  render() {
    let { endpoint, subscriptionEndpoint } = this.state
    // If no  endpoint passed tries to get one from url
    if (!endpoint) {
      endpoint = getParameterByName('endpoint')
    }
    if (!subscriptionEndpoint) {
      subscriptionEndpoint = getParameterByName('subscription')
    }

    return (
      <Wrapper>
        <div
          style={{
            color: 'white',
            backgroundColor: '#09141c',
          }}
        >
          <select
            onChange={(data) => {
              console.log(data.target.value)
              if (
                data.target.value == 'Development' ||
                data.target.value == 'Production'
              ) {
                this.setState({ selectedEnvironment: data.target.value })
              }
            }}
          >
            <option
              value="Development"
              selected={this.state.selectedEnvironment == 'Development'}
            >
              Development
            </option>
            <option
              value="Production"
              selected={this.state.selectedEnvironment == 'Production'}
            >
              Production
            </option>
          </select>
        </div>
        <PlaygroundWrapper
          headers={{
            'x-gadget-environment': this.state.selectedEnvironment,
            Authorization: 'Bearer gsk-pa23ZDaiHWiQq6xDeyLX7KWVRBGGE3p4', // placeholder while forking
          }}
          endpoint="https://hepda.ggt.pub:3000/api/graphql"
          subscriptionEndpoint="https://hepda.ggt.pub:3000/api/graphql"
        />
      </Wrapper>
    )
  }
}

const ConnectedGraphQLBinApp = connect(null, { injectState })(GraphQLBinApp)

// tslint:disable
export default class GraphQLBinAppHOC extends React.Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <ConnectedGraphQLBinApp {...this.props} />
      </Provider>
    )
  }
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`
