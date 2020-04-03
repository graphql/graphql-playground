import * as React from 'react'
import { SignInIcon, SignOutIcon } from './Icons'
import { styled } from '../styled'
import { connect } from 'react-redux'
import { editHeaders } from '../state/sessions/actions'
import { getHeaders } from '../state/sessions/selectors'
import { createStructuredSelector } from 'reselect'

import { UserManager as OidcUserManager } from 'oidc-client'

export interface Props {
  endpoint: string
  editHeaders: (headers: string, endpoint: string) => void
  sessionHeaders?: any
  authority: string
  clientId: string
  responseType?: string
  scope?: string
  redirectUri?: string
  silentRedirectUri?: string
}

export interface State {
  user?: any
  userManager: any
}

class UserManager extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    const { authority, clientId } = this.props

    let { responseType, scope, redirectUri, silentRedirectUri } = this.props

    responseType = responseType || 'id_token token'
    scope = scope || 'openid'
    redirectUri = redirectUri || this.generateRedirectUri()
    silentRedirectUri =
      silentRedirectUri || this.generateSilentRedirectUri(redirectUri)

    const userManager = new OidcUserManager({
      automaticSilentRenew: true,
      authority,
      client_id: clientId,
      response_type: responseType,
      scope,
      redirect_uri: redirectUri,
      silent_redirect_uri: silentRedirectUri,
    })

    this.state = { userManager }
    userManager.events.addUserLoaded(user => this.setState({ user }))
    userManager.events.addUserUnloaded(() => this.setState({ user: null }))
    userManager.getUser().then(user => this.setState({ user }))
  }

  render() {
    return (
      <Wrapper>
        <IconWrapper>
          {this.state && this.state.user ? (
            <SignOutIcon
              width={23}
              height={23}
              title="Sign Out"
              onClick={this.signOut}
            />
          ) : (
            <SignInIcon
              width={23}
              height={23}
              title="Sign In"
              onClick={this.signIn}
            />
          )}
        </IconWrapper>
      </Wrapper>
    )
  }

  componentDidUpdate() {
    const { sessionHeaders: currentHeaders } = this.props
    const prettyPrint = currentHeaders && currentHeaders.includes('\n')
    let headers
    try {
      headers = JSON.parse(currentHeaders)
    } catch {
      //
    }

    if (this.state && this.state.user) {
      const { access_token, id_token } = this.state.user
      const token = access_token || id_token

      if (!currentHeaders) {
        this.props.editHeaders(
          `{\n  "authorization": "Bearer ${token}"\n}`,
          this.props.endpoint,
        )
      } else if (headers && headers.authorization !== `Bearer ${token}`) {
        const updatedHeaders = JSON.stringify(
          {
            ...headers,
            authorization: `Bearer ${token}`,
          },
          null,
          prettyPrint ? 2 : undefined,
        )
        if (updatedHeaders !== currentHeaders) {
          this.props.editHeaders(updatedHeaders, this.props.endpoint)
        }
      }
    } else if (headers) {
      if ('authorization' in headers) {
        delete headers.authorization
        this.props.editHeaders(
          Object.keys(headers).length
            ? JSON.stringify(headers, null, prettyPrint ? 2 : undefined)
            : '',
          this.props.endpoint,
        )
      }
    }
  }

  generateRedirectUri = () => {
    let ret = window.location.href
    if (!ret.endsWith('/')) {
      ret += '/'
    }
    return `${ret}oauth2-redirect.html`
  }

  generateSilentRedirectUri = redirectUri => {
    const ret = new URL(redirectUri)
    const search = new URLSearchParams(ret.search)
    search.append('silent', 'true')
    ret.search = search.toString()
    return ret.toString()
  }

  signIn = () => {
    const { userManager } = this.state
    userManager.signinPopup()
  }

  signOut = () => {
    const { userManager } = this.state
    userManager.removeUser()
  }
}

const mapStateToProps = createStructuredSelector({
  sessionHeaders: getHeaders,
})

export default connect(
  mapStateToProps,
  { editHeaders },
)(UserManager)

const Wrapper = styled.div`
  margin: 5px;
`

const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;

  svg {
    fill: ${p => p.theme.editorColours.icon};
    transition: 0.1s linear fill;
  }

  &:hover {
    svg {
      fill: ${p => p.theme.editorColours.iconHover};
    }
  }
`
