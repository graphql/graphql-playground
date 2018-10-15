import * as React from 'react'
import { SettingsIcon } from './Icons'
import { styled } from '../styled'
import { openSettingsTab } from '../state/sessions/actions'
import { connect } from 'react-redux'

export interface Props {
  onClick: () => void
}

class Settings extends React.Component<Props, {}> {
  render() {
    return (
      <Wrapper>
        <IconWrapper>
          <SettingsIcon
            width={23}
            height={23}
            onClick={this.props.onClick}
            title="Settings"
          />
        </IconWrapper>
      </Wrapper>
    )
  }
}

export default connect(
  null,
  { onClick: openSettingsTab },
)(Settings)

const Wrapper = styled.div`
  position: absolute;
  z-index: 1005;
  right: 20px;
  top: 17px;
`

const IconWrapper = styled.div`
  position: relative;
  cursor: pointer;

  svg {
    fill: ${p => p.theme.editorColours.icon};
    transition: 0.1s linear fill;
  }

  &:hover {
    svg {
      fill: ${p => p.theme.editorColours.iconHover};
    }
  }
`
