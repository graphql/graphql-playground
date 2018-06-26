import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
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

  .settings-icon svg {
    fill: ${p => p.theme.editorColours.icon};
    transition: 0.1s linear fill;
  }

  &:hover {
    .settings-icon svg {
      fill: ${p => p.theme.editorColours.iconHover};
    }
  }
`
