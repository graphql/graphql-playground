import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import ToggleButton from './ToggleButton'
import Tooltip from './Tooltip'
import { ThemeInterface } from './Theme'
import * as cn from 'classnames'
import { Button } from './Button'
import Copy from './Copy'
import styled, { keyframes } from '../styled'

export interface Props extends ThemeInterface {
  allTabs: boolean
  httpHeaders: boolean
  history: boolean
  onToggleAllTabs: () => void
  onToggleHttpHeaders: () => void
  onToggleHistory: () => void
  onShare: () => void
  shareUrl?: string
  reshare: boolean
  isSharingAuthorization: boolean
}

export interface State {
  open: boolean
}

export default class Share extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }
  render() {
    const { open } = this.state
    const {
      allTabs,
      httpHeaders,
      history,
      onToggleAllTabs,
      onToggleHistory,
      onToggleHttpHeaders,
      localTheme,
      shareUrl,
      onShare,
      reshare,
    } = this.props
    return (
      <div className="settings">
        <style jsx={true}>{`
          .settings {
            @p: .absolute;
            z-index: 1005;
            right: 96px;
            top: 13px;
          }
          .tooltip-text {
            @p: .mr10, .darkBlue50, .fw6, .ttu, .f14;
            letter-spacing: 0.53px;
          }
          .icon {
            @p: .pointer, .relative;
          }
          .tooltip {
            @p: .absolute;
            right: -21px;
          }
          .row {
            @p: .flex, .itemsCenter, .justifyBetween, .relative;
            min-width: 245px;
          }
          .copy {
            @p: .absolute, .right0;
          }
          .row + .row {
            @p: .mt16;
          }
          .button {
            @p: .br2, .f14, .fw6, .ttu, .flex, .itemsCenter, .white40;
            border: 1.5px solid rgba(255, 255, 255, 0.2);
            padding: 5px 9px 6px 9px;
          }
          .button:hover,
          .button.open {
            @p: .bWhite70, .white80;
          }
          .button span {
            @p: .ml10;
          }
          .button.light {
            @p: .bDarkBlue10, .darkBlue40;
          }
          .button.light:hover,
          .button.light.open {
            @p: .bDarkBlue70, .darkBlue80;
          }
          .button.light:hover :global(svg),
          .button.light.open :global(svg) {
            stroke: $darkBlue80;
          }
          .button:hover :global(svg),
          .button.open :global(svg) {
            stroke: $white80;
          }
          input {
            @p: .bgDarkBlue10, .br2, .pv6, .ph10, .fw6, .darkBlue, .f12, .db,
              .w100;
          }
          .copy:hover :global(svg) {
            fill: $darkBlue60;
          }
        `}</style>
        <div className="icon">
          <div
            className={cn('button', localTheme, { open })}
            onClick={this.toggleTooltip}
          >
            <Icon
              src={require('../assets/icons/share.svg')}
              color={localTheme === 'light' ? $v.darkBlue40 : $v.white40}
              stroke={true}
              width={13}
              height={13}
            />
            <span>Share</span>
          </div>
          <div className="tooltip">
            <Tooltip
              open={open}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              renderAfterContent={this.renderAuthSharingWarning}
            >
              <div>
                <div className="row">
                  <span className="tooltip-text" onClick={onToggleAllTabs}>
                    Share all tabs{' '}
                  </span>
                  <ToggleButton checked={allTabs} onChange={onToggleAllTabs} />
                </div>
                <div className="row">
                  <span className="tooltip-text" onClick={onToggleHttpHeaders}>
                    HTTP headers{' '}
                  </span>
                  <ToggleButton
                    checked={httpHeaders}
                    onChange={onToggleHttpHeaders}
                  />
                </div>
                <div className="row">
                  <span className="tooltip-text" onClick={onToggleHistory}>
                    History{' '}
                  </span>
                  <ToggleButton checked={history} onChange={onToggleHistory} />
                </div>
                {shareUrl && (
                  <div className="row">
                    <input value={shareUrl} disabled={true} />
                    <div className="copy">
                      <Copy text={shareUrl}>
                        <Icon
                          src={require('graphcool-styles/icons/fill/copy.svg')}
                          color={$v.darkBlue30}
                          width={25}
                          height={25}
                        />
                      </Copy>
                    </div>
                  </div>
                )}
                <div className="row">
                  <div />
                  <Button hideArrow={true} onClick={onShare}>
                    {reshare && shareUrl ? 'Reshare' : 'Share'}
                  </Button>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  private renderAuthSharingWarning = () => {
    if (!this.props.isSharingAuthorization) {
      return null
    }

    return <AuthSharingWarning />
  }

  private toggleTooltip = () => {
    this.setState(state => ({ open: !state.open }))
  }
}

const AuthSharingWarning = () => (
  <Message>
    <MessageTitle>Watch out!</MessageTitle>
    You’re sharing your <code>Authorization</code> header with the world!
  </Message>
)

// TODO: use theme

const pulse = keyframes`
  0% {
    transform: scale(1.04);
  }

  100% {
    transform: scale(1);
  }
`

const Message = styled.div`
  padding: 12px 16px;
  margin-top: 10px;

  font-size: 14px;
  letter-spacing: normal;

  cursor: default;
  border-radius: 2px;
  background: #f3f4f4;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.15);

  animation: ${pulse} 0.7s ease-in-out infinite alternate;
`

const MessageTitle = styled.div`
  margin-right: 3px;
  margin-bottom: 2px;
  font-weight: bold;
  color: #2a7ed2;
`
