import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import Tooltip from '../Tooltip'
import * as cn from 'classnames'

export interface Props {
  onOpenCodeGeneration: () => void
}

export interface State {
  open: boolean
}

export default class GenerateCodeButton extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
  }
  render() {
    const { open } = this.state
    return (
      <div className="code-generation-button">
        <style jsx={true}>{`
          .code-generation-button {
            @p: .absolute, .pointer;
            z-index: 1005;
            top: -59px;
            right: 13px;
            z-index: 2;
          }
          .tooltip-text {
            @p: .mr10, .darkBlue50, .fw6, .ttu, .f14;
            letter-spacing: 0.53px;
          }
          .icon {
            @p: .pointer, .relative;
          }
          .generate-code {
            padding: 8px;
          }
        `}</style>
        <div className={cn('icon', { open })}>
          <div className="generate-code" onClick={this.toggleTooltip}>
            <Icon
              width={4}
              height={20}
              src={require('../../assets/icons/dots.svg')}
            />
          </div>
          <div className="tooltip">
            <Tooltip
              open={open}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'center',
                vertical: 'top',
              }}
            >
              <div>
                <div className="row">
                  <span
                    className="tooltip-text"
                    onClick={this.props.onOpenCodeGeneration}
                  >
                    Generate Code
                  </span>
                </div>
              </div>
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
