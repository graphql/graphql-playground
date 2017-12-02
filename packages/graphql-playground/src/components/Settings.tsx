import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { styled } from '../styled'
import * as theme from 'styled-theming'

export interface Props {
  onClick: () => void
}

export default class Settings extends React.Component<Props, {}> {
  render() {
    return (
      <Wrapper>
        <IconWrapper>
          <Icon
            src={require('graphcool-styles/icons/fill/settings.svg')}
            width={23}
            height={23}
            onClick={this.props.onClick}
            className={'settings-icon'}
          />
        </IconWrapper>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  position: absolute;
  z-index: 1005;
  right: 20px;
  top: 17px;
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
    transition: 0.1s linear fill;
  }

  &:hover {
    .settings-icon svg {
      fill: ${iconColorActive};
    }
  }
`
