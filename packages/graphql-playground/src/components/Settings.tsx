import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import ToggleButton from './ToggleButton'
import Tooltip from './Tooltip'
import { Theme } from './Playground'
import * as cn from 'classnames'

interface Props {
  theme: Theme
  onToggleTheme: () => void
  onToggleReload: () => void
  useVim: boolean
  onToggleUseVim: () => void
  autoReload: boolean
  onReload: () => void
  endpoint: string
  onChangeEndpoint?: (endpoint: string) => void
  subscriptionsEndpoint: string
  onChangeSubscriptionsEndpoint?: (endpoint: string) => void
}

interface State {
  open: boolean
  endpointUrl: string
}

export default class Settings extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      endpointUrl: props.endpoint,
    }
  }
  render() {
    const { open } = this.state
    const {
      theme,
      onToggleReload,
      autoReload,
      onReload,
      useVim,
      onToggleUseVim,
    } = this.props
    return (
      <div className="settings">
        <style jsx={true}>{`
          .settings {
            @p: .absolute;
            z-index: 1005;
            right: 20px;
            top: 17px;
          }
          .tooltip-text {
            @p: .mr10, .darkBlue50, .fw6, .ttu, .f14;
            letter-spacing: 0.53px;
          }
          .icon {
            @p: .pointer, .relative;
          }
          .icon:hover :global(.settings-icon) :global(svg),
          .icon.open :global(.settings-icon) :global(svg) {
            fill: $white60;
          }
          .icon.light:hover :global(.settings-icon) :global(svg),
          .icon.light.open :global(.settings-icon) :global(svg) {
            fill: $darkBlue60;
          }
          .tooltip {
            @p: .absolute;
            right: -21px;
          }
          .row {
            @p: .flex, .itemsCenter, .justifyBetween;
            min-width: 245px;
          }
          .row + .row {
            @p: .mt16;
          }
          .button {
            @p: .br2, .f14, .fw6, .ttu, .darkBlue40;
            background: #e9eaeb;
            padding: 5px 9px 6px 9px;
          }
          .button:hover {
            @p: .darkBlue50;
            background: #dbdcdc;
          }
          input {
            @p: .bgDarkBlue10, .br2, .pv6, .ph10, .fw6, .darkBlue, .f12, .db,
              .w100;
          }
          .inner-row {
            @p: .w100;
            padding-right: 20px;
          }
        `}</style>
        <div className={cn('icon', theme, { open })}>
          <Icon
            src={require('graphcool-styles/icons/fill/settings.svg')}
            color={theme === 'light' ? $v.darkBlue20 : $v.white20}
            width={23}
            height={23}
            onClick={this.toggleTooltip}
            className={'settings-icon'}
          />
          <div className="tooltip">
            <Tooltip
              open={open}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <div>
                <div className="row">
                  <span
                    className="tooltip-text"
                    onClick={this.props.onToggleTheme}
                  >
                    LIGHT MODE{' '}
                  </span>
                  <ToggleButton
                    checked={theme === 'light'}
                    onChange={this.props.onToggleTheme}
                  />
                </div>
                <div className="row">
                  <span className="tooltip-text" onClick={onToggleUseVim}>
                    VIM MODE{' '}
                  </span>
                  <ToggleButton checked={useVim} onChange={onToggleUseVim} />
                </div>
                <div className="row">
                  <span className="tooltip-text" onClick={onToggleReload}>
                    AUTO-RELOAD SCHEMA{' '}
                  </span>
                  <ToggleButton
                    checked={autoReload}
                    onChange={onToggleReload}
                  />
                </div>
                <div className="row">
                  <div className="button" onClick={onReload}>
                    Reload Schema
                  </div>
                </div>
                <div className="row">
                  <div className="inner-row">
                    <div>Endpoint</div>
                    <input
                      value={this.props.endpoint}
                      placeholder="Enter an endpoint..."
                      onChange={this.handleChangeEndpoint}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="inner-row">
                    <div>Subscriptions Endpoint</div>
                    <input
                      value={this.props.subscriptionsEndpoint}
                      placeholder="Enter a subscriptions endpoint..."
                      onChange={this.handleChangeSubscriptionsEndpoint}
                    />
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  private handleChangeEndpoint = e => {
    if (typeof this.props.onChangeEndpoint === 'function') {
      this.props.onChangeEndpoint(e.target.value)
    }
  }

  private handleChangeSubscriptionsEndpoint = e => {
    if (typeof this.props.onChangeSubscriptionsEndpoint === 'function') {
      this.props.onChangeSubscriptionsEndpoint(e.target.value)
    }
  }

  private toggleTooltip = () => {
    this.setState(state => ({ open: !state.open }))
  }
}
