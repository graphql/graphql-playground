import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import ToggleButton from './ToggleButton'
import Tooltip from './Tooltip'
import { LocalThemeInterface } from './Theme'
import styled, { css } from '../styled'
import * as theme from 'styled-theming'

export interface Props extends LocalThemeInterface {
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

export interface State {
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
      localTheme,
      onToggleReload,
      autoReload,
      onReload,
      useVim,
      onToggleUseVim,
    } = this.props
    return (
      <Wrapper>
        <IconWrapper open={open}>
          <Icon
            src={require('graphcool-styles/icons/fill/settings.svg')}
            width={23}
            height={23}
            onClick={this.toggleTooltip}
            className={'settings-icon'}
          />
          <TooltipWrapper>
            <Tooltip
              open={open}
              onClose={this.toggleTooltip}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
            >
              <div>
                <Row>
                  <TooltipText onClick={this.props.onToggleTheme}>
                    LIGHT MODE{' '}
                  </TooltipText>
                  <ToggleButton
                    checked={localTheme === 'light'}
                    onChange={this.props.onToggleTheme}
                  />
                </Row>
                <Row>
                  <TooltipText onClick={onToggleUseVim}>VIM MODE </TooltipText>
                  <ToggleButton checked={useVim} onChange={onToggleUseVim} />
                </Row>
                <Row>
                  <TooltipText onClick={onToggleReload}>
                    AUTO-RELOAD SCHEMA{' '}
                  </TooltipText>
                  <ToggleButton
                    checked={autoReload}
                    onChange={onToggleReload}
                  />
                </Row>
                <Row>
                  <Button onClick={onReload}>Reload Schema</Button>
                </Row>
                <Row>
                  <InnerRow>
                    <div>Endpoint</div>
                    <Input
                      value={this.props.endpoint}
                      placeholder="Enter an endpoint..."
                      onChange={this.handleChangeEndpoint}
                    />
                  </InnerRow>
                </Row>
                <Row>
                  <InnerRow>
                    <div>Subscriptions Endpoint</div>
                    <Input
                      value={this.props.subscriptionsEndpoint}
                      placeholder="Enter a subscriptions endpoint..."
                      onChange={this.handleChangeSubscriptionsEndpoint}
                    />
                  </InnerRow>
                </Row>
              </div>
            </Tooltip>
          </TooltipWrapper>
        </IconWrapper>
      </Wrapper>
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

const Wrapper = styled.div`
  position: absolute;
  z-index: 1005;
  right: 20px;
  top: 17px;
`

const TooltipText = styled.div`
  margin-right: ${p => p.theme.sizes.small10};

  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontSemiBold};
  letter-spacing: 0.53px;
  text-transform: uppercase;

  color: ${p => p.theme.colours.darkBlue50};
`

const iconColor = theme('mode', {
  light: p => p.theme.colours.darkBlue20,
  dark: p => p.theme.colours.white20,
})

const iconColorActive = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => p.theme.colours.white60,
})

// prettier-ignore
const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;

  .settings-icon svg {
    fill: ${iconColor};
  }

  &:hover {
    .settings-icon svg {
      fill: ${iconColorActive};
    }
  }

  ${(p: { open: boolean }) => p.open ? css`
    .settings-icon svg {
      fill: ${iconColorActive};
    }
  ` : ''}
`

const TooltipWrapper = styled.div`
  position: absolute;
  right: -21px;
`

const Row = styled.div`
  position: relative;
  min-width: 245px;
  margin-top: ${p => p.theme.sizes.small16};

  display: flex;
  align-items: center;
  justify-content: space-between;

  &:first-child {
    margin-top: 0;
  }
`

const Input = styled.input`
  display: block;
  width: 100%;
  padding: ${p => p.theme.sizes.small6} ${p => p.theme.sizes.small10};

  font-weight: ${p => p.theme.sizes.fontSemiBold};
  font-size: ${p => p.theme.sizes.fontTiny};

  border-radius: ${p => p.theme.sizes.smallRadius};
  background: ${p => p.theme.colours.darkBlue10};
  color: ${p => p.theme.colours.darkBlue};
`

const InnerRow = styled.div`
  width: 100%;
  padding-right: 20px;
`

const Button = styled.button`
  display: block;
  padding: 5px 9px 6px 9px;

  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontSemiBold};
  text-transform: uppercase;

  cursor: pointer;
  border-radius: ${p => p.theme.sizes.smallRadius};
  color: ${p => p.theme.colours.darkBlue50};
  background: #e9eaeb;

  &:hover {
    color: ${p => p.theme.colours.darkBlue60};
    background: #dbdcdc;
  }
`
