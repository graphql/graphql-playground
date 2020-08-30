import * as React from 'react'
import { Provider, connect } from 'react-redux'
import createStore from '../state/createStore'
import 'isomorphic-fetch'
import EndpointPopup from './EndpointPopup'
import { styled, ThemeProvider, theme as styledTheme } from '../styled'
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
}

export interface State {
  endpoint?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  loading: boolean
  headers: any
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
        .then(res => res.json())
        .then(res => {
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
        {this.state.loading ? null : !this.state.endpoint ||
        this.state.endpoint.length === 0 ? (
          <ThemeProvider theme={styledTheme}>
            <EndpointPopup
              onRequestClose={this.handleChangeEndpoint}
              endpoint={this.state.endpoint || ''}
            />
          </ThemeProvider>
        ) : (
          <PlaygroundWrapper
            endpoint={endpoint}
            headers={this.state.headers}
            subscriptionEndpoint={subscriptionEndpoint}
          />
        )}
      </Wrapper>
    )
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
    localStorage.setItem('last-endpoint', endpoint)
  }
}

const ConnectedGraphQLBinApp = connect(
  null,
  { injectState },
)(GraphQLBinApp)

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
