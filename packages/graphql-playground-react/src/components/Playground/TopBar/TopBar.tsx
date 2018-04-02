import * as React from 'react'
import { styled } from '../../../styled/index'
import * as theme from 'styled-theming'
import { darken, lighten } from 'polished'
import * as copy from 'copy-to-clipboard'

import Share from '../../Share'
import ReloadIcon from './ReloadIcon'
import { keyframes, StyledComponentClass } from 'styled-components'
import * as cx from 'classnames'
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
  fixedEndpoint?: boolean
  isReloadingSchema: boolean
  endpointUnreachable: boolean

  editEndpoint: (value: string) => void
  prettifyQuery: () => void
  openHistory: () => void
  share: () => void
  refetchSchema: () => void
}

class TopBar extends React.Component<Props, {}> {
  static contextTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired,
    }),
  }
  render() {
    const { endpointUnreachable } = this.props
    return (
      <TopBarWrapper>
        <Button onClick={this.props.prettifyQuery}>Prettify</Button>
        <Button onClick={this.openHistory}>History</Button>
        <UrlBarWrapper>
          <UrlBar
            value={this.props.endpoint}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onBlur={this.props.refetchSchema}
            disabled={this.props.fixedEndpoint}
            className={cx({ active: !this.props.fixedEndpoint })}
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
        <Button onClick={this.copyCurlToClipboard}>Copy CURL</Button>
        <Share>
          <Button>Share Playground</Button>
        </Share>
      </TopBarWrapper>
    )
  }
  copyCurlToClipboard = () => {
    const curl = this.getCurl()
    copy(curl)
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

export default connect(mapStateToProps, {
  editEndpoint,
  prettifyQuery,
  openHistory,
  share,
  refetchSchema,
})(TopBar)

const buttonColor = theme('mode', {
  light: p => p.theme.colours.darkBlue10,
  dark: p => p.theme.colours.darkerBlue,
})

const buttonHoverColor = theme('mode', {
  light: p => darken(0.02, p.theme.colours.darkBlue20),
  dark: p => lighten(0.02, p.theme.colours.darkerBlue),
})

const backgroundColor = theme('mode', {
  light: p => '#eeeff0',
  dark: p => p.theme.colours.darkBlue,
})

const inactiveFontColor = theme('mode', {
  light: p => p.theme.colours.darkBlue30,
  dark: p => p.theme.colours.white30,
})

const fontColor = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => p.theme.colours.white60,
})

const barBorder = theme('mode', {
  light: p => p.theme.colours.darkBlue20,
  dark: p => '#09141c',
})

const spinnerColor = theme('mode', {
  light: p => p.theme.colours.black40,
  dark: p => p.theme.colours.white30,
})

export const Button: StyledComponentClass<any, any, any> = styled.button`
  text-transform: uppercase;
  font-weight: 600;
  color: ${fontColor};
  background: ${buttonColor};
  border-radius: 2px;
  flex: 0 0 auto;
  letter-spacing: 0.53px;
  font-size: 14px;
  padding: 6px 9px 7px 10px;
  * + & {
    margin-left: 6px;
  }
  cursor: pointer;
  transition: 0.1s linear background-color;
  &:hover {
    background-color: ${buttonHoverColor};
  }
`

const TopBarWrapper = styled.div`
  display: flex;
  background: ${backgroundColor};
  padding: 10px 10px 4px;
  align-items: center;
`

const UrlBar = styled.input`
  background: ${buttonColor};
  border-radius: 4px;
  color: ${inactiveFontColor};
  border: 1px solid ${barBorder};
  padding: 6px 12px;
  font-size: 13px;
  flex: 1;
  &.active {
    color: ${fontColor};
  }
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

const bounceAnimation = keyframes`
  0%, 100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
`

const Pulse = styled.div`
  width: 16px;
  height: 16px;
  background-color: ${spinnerColor};
  border-radius: 100%;
  animation: ${bounceAnimation} 2s infinite ease-in-out;
  -webkit-animation: ${bounceAnimation} 2s infinite ease-in-out;
`

const DelayedPulse = styled.div`
  width: 16px;
  height: 16px;
  position: absolute;
  top: 0;
  background-color: ${spinnerColor};
  border-radius: 100%;
  animation: ${bounceAnimation} 2s infinite ease-in-out;
  -webkit-animation: ${bounceAnimation} 2s infinite ease-in-out;
  animation-delay: -1s;
  -webkit-animation-delay: -1s;
`

const SpinnerWrapper = styled.div`
  position: relative;
  margin: 6px;
`

const Spinner = () => (
  <SpinnerWrapper>
    <Pulse />
    <DelayedPulse />
  </SpinnerWrapper>
)
