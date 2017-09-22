import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import ToggleButton from 'graphcool-tmp-ui/lib/ToggleButton'
import Tooltip from 'graphcool-tmp-ui/lib/Tooltip'
import { Theme } from './Playground'

interface Props {
  theme: Theme
  onToggleTheme: () => void
}

interface State {
  open: boolean
}

export default class ThemeSwitch extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }
  render() {
    const { open } = this.state
    const { theme } = this.props
    return (
      <div className="theme-switch">
        <style jsx={true}>{`
          .theme-switch {
            @p: .absolute, .z999;
            right: 21px;
            top: 17px;
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
        `}</style>
        <div className="icon">
          <Icon
            src={require('graphcool-styles/icons/fill/settings.svg')}
            color={theme === 'light' ? $v.gray20 : $v.white20}
            width={23}
            height={23}
            onClick={this.toggleTooltip}
          />
          <div className="tooltip">
            <Tooltip
              open={open}
              onClick={this.props.onToggleTheme}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <span className="tooltip-text">LIGHT MODE </span>
              <ToggleButton
                checked={theme === 'light'}
                onChange={this.props.onToggleTheme}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  private toggleTooltip = () => {
    this.setState(state => ({ open: !state.open }))
  }
}
