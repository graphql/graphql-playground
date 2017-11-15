import * as React from 'react'
import * as fetch from 'isomorphic-fetch'
import { Provider } from 'react-redux'
import createStore from '../createStore'
import Playground from './Playground'
import 'isomorphic-fetch'
import EndpointPopup from './EndpointPopup'
import Loading from './Loading'
// import {BrowserRouter} from 'react-router-dom'

const store = createStore()

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
}

export interface State {
  endpoint?: string
  subscriptionEndpoint?: string
  shareUrl?: string
  loading: boolean
  session?: any
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      endpoint: props.endpoint,
      subscriptionEndpoint: props.subscriptionEndpoint,
      loading: false,
    }
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      if (this.props.match.params.id === 'new') {
        return
      }
      this.setState({ loading: true })
      fetch('https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
        query ($id: String!) {
          session(id: $id) {
            session
            endpoint
          }
        }
      `,
          variables: { id: this.props.match.params.id },
        }),
      })
        .then(res => res.json())
        .then(res => {
          if (!res.data || res.data.session === null) {
            return this.props.history.push('/new')
          }
          this.setState({
            session: JSON.parse(res.data.session.session),
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
      <Provider store={store}>
        <div className={'wrapper'}>
          <style jsx={true}>{`
            .wrapper {
              @p: .w100, .h100, .bgDarkBlue;
            }
            .loading {
              @p: .f20, .white, .flex, .w100, .h100, .bgDarkBlue, .itemsCenter,
                .justifyCenter;
            }
          `}</style>
          {this.state.loading ? (
            <Loading />
          ) : !this.state.endpoint || this.state.endpoint.length === 0 ? (
            <EndpointPopup
              onRequestClose={this.handleChangeEndpoint}
              endpoint={
                this.state.endpoint ||
                localStorage.getItem('last-endpoint') ||
                ''
              }
            />
          ) : (
            <Playground
              endpoint={endpoint}
              subscriptionsEndpoint={subscriptionEndpoint}
              onChangeEndpoint={this.handleChangeEndpoint}
              share={this.share}
              shareUrl={this.state.shareUrl}
              session={this.state.session}
            />
          )}
        </div>
      </Provider>
    )
  }

  private handleChangeEndpoint = endpoint => {
    this.setState({ endpoint })
    localStorage.setItem('last-endpoint', endpoint)
  }

  private share = (session: any) => {
    fetch('https://api.graph.cool/simple/v1/cj81hi46q03c30196uxaswrz2', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        mutation ($session: String! $endpoint: String!) {
          addSession(session: $session endpoint: $endpoint) {
            id
          }
        }
      `,
        variables: {
          session: JSON.stringify(session),
          endpoint: this.state.endpoint,
        },
      }),
    })
      .then(res => res.json())
      .then(res => {
        const shareUrl = `https://graphqlbin.com/${res.data.addSession.id}`
        // const shareUrl = `${location.origin}/${res.data.addSession.id}`
        this.setState({ shareUrl })
        this.props.history.push(`/${res.data.addSession.id}`)
      })
  }
}

export default App
