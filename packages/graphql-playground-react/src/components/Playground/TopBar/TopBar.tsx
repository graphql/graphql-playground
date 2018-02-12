import * as React from 'react'
import { styled } from '../../../styled/index'
import * as theme from 'styled-theming'
import { darken, lighten } from 'polished'
import * as CopyToClipboard from 'react-copy-to-clipboard'
import Share, { SharingProps } from '../../Share'
import ReloadIcon from './ReloadIcon'
import { keyframes, StyledComponentClass } from 'styled-components'
import * as cx from 'classnames'
import shallowEqual from '../util/shallowEqual'

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

export default class TopBar extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps: Props) {
    const deconstruct = ({ sharing, ...restProps }: Props) => ({
      sharing,
      restProps,
    })
    const deconstructedProps = deconstruct(this.props)
    const deconstructedNextProps = deconstruct(nextProps)
    const shouldUpdate =
      !shallowEqual(
        deconstructedProps.sharing,
        deconstructedNextProps.sharing,
      ) ||
      !shallowEqual(
        deconstructedProps.restProps,
        deconstructedNextProps.restProps,
      )
    return shouldUpdate
  }
  render() {
    const { endpointUnreachable } = this.props
    return (
      <TopBarWrapper>
        <Button onClick={this.props.onClickPrettify}>Prettify</Button>
        <Button onClick={this.props.onClickHistory}>History</Button>
        <UrlBarWrapper>
          <UrlBar
            value={this.props.endpoint}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onBlur={this.props.onReloadSchema}
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
              onReloadSchema={this.props.onReloadSchema}
            />
          )}
        </UrlBarWrapper>
        <CopyToClipboard text={this.props.curl}>
          <Button>Copy CURL</Button>
        </CopyToClipboard>
        {this.props.sharing && (
          <Share {...this.props.sharing}>
            <Button>Share Playground</Button>
          </Share>
        )}
      </TopBarWrapper>
    )
  }
  onChange = e => {
    if (typeof this.props.onChangeEndpoint === 'function') {
      this.props.onChangeEndpoint(e.target.value)
    }
  }
  onKeyDown = e => {
    if (e.keyCode === 13 && typeof this.props.onReloadSchema === 'function') {
      this.props.onReloadSchema()
    }
  }
}

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
