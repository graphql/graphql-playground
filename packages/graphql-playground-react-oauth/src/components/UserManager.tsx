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
  redirectUri: string
}

export interface State {
  user?: any
  userManager: any
}

class UserManager extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    const userManager = new OidcUserManager({
      authority: this.props.authority,
      client_id: this.props.clientId,
      response_type: 'token',
      redirect_uri: this.props.redirectUri,
    })

    this.state = { userManager }

    userManager.getUser().then(user => this.setState({ user }))
  }

  componentDidMount() {
    this.setHeaders()
  }

  componentDidUpdate() {
    this.setHeaders()
  }

  setHeaders = () => {
    try {
      const sessionHeaders = JSON.parse(this.props.sessionHeaders)
      if (this.state && this.state.user) {
        sessionHeaders.authorization = `Bearer ${this.state.user.access_token}`
      } else if (sessionHeaders.hasOwnProperty('authorization')) {
        delete sessionHeaders.authorization
      }

      this.props.editHeaders(
        JSON.stringify(
          sessionHeaders,
          null,
          this.props.sessionHeaders.includes('\n') ? 2 : undefined,
        ),
        this.props.endpoint,
      )
    } catch (e) {
      //
    }
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

  signIn = () => {
    const { userManager } = this.state
    userManager.signinPopup().then(user => this.setState({ user }))
  }

  signOut = () => {
    const { userManager } = this.state
    userManager.removeUser().then(() => this.setState({ user: null }))
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
