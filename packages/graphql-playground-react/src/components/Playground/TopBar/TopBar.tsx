import * as React from 'react'
import { styled } from '../../../styled/index'
import * as theme from 'styled-theming'
import { darken, lighten } from 'polished'
import * as CopyToClipboard from 'react-copy-to-clipboard'
import Share, { SharingProps } from '../../Share'
import ReloadIcon from './ReloadIcon'
import { keyframes, StyledComponentClass } from 'styled-components'
import * as cx from 'classnames'

export interface Props {
  endpoint: string
  onChangeEndpoint?: (value: string) => void
  endpointDisabled: boolean
  onClickPrettify?: () => void
  onClickHistory?: () => void
  curl: string
  onClickShare?: () => void
  onReloadSchema?: () => void
  isReloadingSchema: boolean
  sharing?: SharingProps
  fixedEndpoint?: boolean
  endpointUnreachable: boolean
}

const TopBar: React.SFC<Props> = props => (
  <TopBarWrapper>
    <Button onClick={props.onClickPrettify}>Prettify</Button>
    <Button onClick={props.onClickHistory}>History</Button>
    <UrlBarWrapper>
      <UrlBar
        value={props.endpoint}
        onChange={({ target }) =>
          props.onChangeEndpoint ? props.onChangeEndpoint(target.value) : null
        }
        onKeyDown={({ keyCode }) =>
          keyCode === 13 && props.onReloadSchema ? props.onReloadSchema() : null
        }
        onBlur={props.onReloadSchema}
        disabled={props.fixedEndpoint}
        className={cx({ active: !props.fixedEndpoint })}
      />
      {props.endpointUnreachable ? (
        <ReachError>
          <span>Server cannot be reached</span>
          <Spinner />
        </ReachError>
      ) : (
        <ReloadIcon
          isReloadingSchema={props.isReloadingSchema}
          onReloadSchema={props.onReloadSchema}
        />
      )}
    </UrlBarWrapper>
    <CopyToClipboard text={props.curl}>
      <Button>Copy CURL</Button>
    </CopyToClipboard>
    {props.sharing && (
      <Share {...props.sharing}>
        <Button>Share Playground</Button>
      </Share>
    )}
  </TopBarWrapper>
)

export default TopBar

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
