import * as React from 'react'
import { styled } from '../../../styled/index'
import * as copy from 'copy-to-clipboard'

import Share from '../../Share'
import ReloadIcon from './ReloadIcon'
import { createStructuredSelector } from 'reselect'
import {
  getEndpoint,
  getSelectedSession,
  getIsReloadingSchema,
  getEndpointUnreachable,
} from '../../../state/sessions/selectors'
import { connect } from 'react-redux'
import { getFixedEndpoint } from '../../../state/general/selectors'
import * as PropTypes from 'prop-types'
import {
  editEndpoint,
  prettifyQuery,
  refetchSchema,
} from '../../../state/sessions/actions'
import { share } from '../../../state/sharing/actions'
import { openHistory } from '../../../state/general/actions'

export interface Props {
  endpoint: string
  shareEnabled?: boolean
  fixedEndpoint?: boolean
  isReloadingSchema: boolean
  endpointUnreachable: boolean

  editEndpoint: (value: string) => void
  prettifyQuery: () => void
  openHistory: () => void
  share: () => void
  refetchSchema: () => void
}

interface State {
  showMobileMenu: boolean
}

class TopBar extends React.Component<Props, State> {
  static contextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  }
  state = { showMobileMenu: false }
  render() {
    const { endpointUnreachable } = this.props
    return (
      <TopBarWrapper>
        <TopBarInnerWrapper>
          <Button mobileOnly={true} onClick={this.toggleMobileMenu}>
            Menu
          </Button>
          <Button desktopOnly={true} onClick={this.props.prettifyQuery}>
            Prettify
          </Button>
          <Button desktopOnly={true} onClick={this.openHistory}>
            History
          </Button>
          <UrlBarWrapper>
            <UrlBar
              value={this.props.endpoint}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onBlur={this.props.refetchSchema}
              disabled={this.props.fixedEndpoint}
              active={!this.props.fixedEndpoint}
            />
            {endpointUnreachable ? (
              <ReachError>
                <span>Server cannot be reached</span>
                <Spinner />
              </ReachError>
            ) : (
              <ReloadIcon
                isReloadingSchema={this.props.isReloadingSchema}
                onReloadSchema={this.props.refetchSchema}
              />
            )}
          </UrlBarWrapper>
          <Button desktopOnly={true} onClick={this.copyCurlToClipboard}>
            Copy CURL
          </Button>
          <Button alt={true} onClick={this.toggleMobileMenu}>
            Run
          </Button>
          {this.props.shareEnabled && (
            <Share>
              <Button>Share Playground</Button>
            </Share>
          )}
        </TopBarInnerWrapper>
        <MobileMenu mobileOnly={true} hidden={!this.state.showMobileMenu}>
          <Button onClick={this.props.prettifyQuery}>Prettify</Button>
          <Button onClick={this.openHistory}>History</Button>
          <Button onClick={this.copyCurlToClipboard}>Copy CURL</Button>
        </MobileMenu>
      </TopBarWrapper>
    )
  }
  copyCurlToClipboard = () => {
    const curl = this.getCurl()
    copy(curl)
  }
  toggleMobileMenu = () => {
    this.setState({ showMobileMenu: !this.state.showMobileMenu })
  }
  onChange = e => {
    this.props.editEndpoint(e.target.value)
  }
  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.props.refetchSchema()
    }
  }
  openHistory = () => {
    this.props.openHistory()
  }
  getCurl = () => {
    // no need to rerender the whole time. only on-demand the store is fetched
    const session = getSelectedSession(this.context.store.getState())
    let variables
    try {
      variables = JSON.parse(session.variables)
    } catch (e) {
      //
    }
    const data = JSON.stringify({
      query: session.query,
      variables,
      operationName: session.operationName,
    })
    let sessionHeaders
    try {
      sessionHeaders = JSON.parse(session.headers!)
    } catch (e) {
      //
    }
    const headers = {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Connection: 'keep-alive',
      DNT: '1',
      Origin: location.origin || session.endpoint,
      ...sessionHeaders,
    }
    const headersString = Object.keys(headers)
      .map(key => {
        const value = headers[key]
        return `-H '${key}: ${value}'`
      })
      .join(' ')
    return `curl '${
      session.endpoint
    }' ${headersString} --data-binary '${data}' --compressed`
  }
}

const mapStateToProps = createStructuredSelector({
  endpoint: getEndpoint,
  fixedEndpoint: getFixedEndpoint,
  isReloadingSchema: getIsReloadingSchema,
  endpointUnreachable: getEndpointUnreachable,
})

export default connect(
  mapStateToProps,
  {
    editEndpoint,
    prettifyQuery,
    openHistory,
    share,
    refetchSchema,
  },
)(TopBar)

export const Button = styled.button`
  text-transform: uppercase;
  font-weight: 600;
  color: ${p =>
    p.alt ? p.theme.editorColours.button : p.theme.editorColours.buttonText};
  background: ${p => (p.alt ? '#fff' : p.theme.editorColours.button)};
  border-radius: 2px;
  flex: 0 0 auto;
  letter-spacing: 0.53px;
  font-size: 14px;
  padding: 6px 9px 7px 10px;
  margin-left: 6px;
  @media screen and (min-width: 768px) {
    display: ${p => p.mobileOnly && `none`};
  }
  @media screen and (max-width: 767px) {
    display: ${p => p.desktopOnly && `none`};
  }

  cursor: pointer;
  transition: 0.1s linear background-color;
  &:hover {
    background-color: ${p => p.theme.editorColours.buttonHover};
  }
`

const MobileMenu = styled.div`
  padding: 10px 0 0;
  @media screen and (min-width: 768px) {
    display: ${p => p.mobileOnly && `none`};
  }
`

const TopBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${p => p.theme.editorColours.navigationBar};
  padding: 10px 10px 4px 4px;
  justify-content: center;
`

const TopBarInnerWrapper = styled.div`
  display: flex;
`

interface UrlBarProps {
  active: boolean
}

const UrlBar = styled<UrlBarProps, 'input'>('input')`
  background: ${p => p.theme.editorColours.button};
  border-radius: 4px;
  color: ${p =>
    p.active
      ? p.theme.editorColours.navigationBarText
      : p.theme.editorColours.textInactive};
  border: 1px solid ${p => p.theme.editorColours.background};
  padding: 6px 12px;
  font-size: 13px;
  flex: 1;
`

const UrlBarWrapper = styled.div`
  flex: 1;
  margin-left: 6px;
  position: relative;
  display: flex;
  align-items: center;
`

const ReachError = styled.div`
  position: absolute;
  right: 5px;
  display: flex;
  align-items: center;
  color: #f25c54;
`

const Pulse = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${p => p.theme.editorColours.icon};
  border-radius: 100%;
`

const SpinnerWrapper = styled.div`
  position: relative;
  margin: 6px;
`

const Spinner = () => (
  <SpinnerWrapper>
    <Pulse />
  </SpinnerWrapper>
)
