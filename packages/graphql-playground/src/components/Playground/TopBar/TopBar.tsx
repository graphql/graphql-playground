import * as React from 'react'
import { styled } from '../../../styled/index'
import * as theme from 'styled-theming'
import { darken, lighten } from 'polished'
import * as CopyToClipboard from 'react-copy-to-clipboard'
import Share, { SharingProps } from '../../Share'
import { StyledComponentClass } from 'styled-components'

export interface Props {
  endpoint: string
  onChangeEndpoint?: (value: string) => void
  endpointDisabled: boolean
  onClickPrettify?: () => void
  onClickHistory?: () => void
  curl: string
  onClickShare?: () => void
  sharing?: SharingProps
}

export default class TopBar extends React.Component<Props, {}> {
  render() {
    return (
      <TopBarWrapper>
        <Button onClick={this.props.onClickPrettify}>Prettify</Button>
        <Button onClick={this.props.onClickHistory}>History</Button>
        <UrlBar value={this.props.endpoint} onChange={this.onChange} />
        <CopyToClipboard text={this.props.curl}>
          <Button>Copy CURL</Button>
        </CopyToClipboard>
        {this.props.sharing && (
          <Share {...this.props.sharing}>
            <Button onClick={this.props.onClickShare}>Share Playground</Button>
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
}

const buttonColor = theme('mode', {
  light: p => p.theme.colours.darkBlue20,
  dark: p => p.theme.colours.darkerBlue,
})

const buttonHoverColor = theme('mode', {
  light: p => darken(0.02, p.theme.colours.darkBlue20),
  dark: p => lighten(0.02, p.theme.colours.darkerBlue),
})

const fontColor = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => p.theme.colours.white60,
})

const barBorder = theme('mode', {
  light: p => p.theme.colours.darkBlue20,
  dark: p => '#09141c',
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
  background: ${p => p.theme.colours.darkBlue};
  padding: 10px;
  padding-bottom: 4px;
  align-items: center;
`

const UrlBar = styled.input`
  background: ${buttonColor};
  border-radius: 4px;
  color: ${fontColor};
  flex: 1;
  margin-left: 6px;
  border: 1px solid ${barBorder};
  padding: 6px 12px;
  font-size: 13px;
`
