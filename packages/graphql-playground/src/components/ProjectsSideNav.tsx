import * as React from 'react'
import { GraphQLConfigEnpointsMapData } from '../graphqlConfig'
import ProjectsSideNavItem from './ProjectsSideNavItem'
import { Icon, $v } from 'graphcool-styles'
import { styled } from '../styled/index'
import * as theme from 'styled-theming'
import { darken } from 'polished'
import { getEndpointFromEndpointConfig } from './util'

export interface Props {
  endpoints: GraphQLConfigEnpointsMapData
  folderName: string
  theme: string
  activeEnv: string
  onSelectEnv: (endpoint: string) => void
  onNewWorkspace?: () => void
  showNewWorkspace: boolean
  isElectron: boolean
  onEditConfig: () => void
  getSessionCount: (endpoint: string) => number
}

export default class ProjectsSideNav extends React.Component<Props, {}> {
  render() {
    const {
      endpoints,
      activeEnv,
      folderName,
      onSelectEnv,
      onNewWorkspace,
      isElectron,
    } = this.props
    return (
      <SideNav>
        <List isElectron={isElectron}>
          <div>
            <TitleRow>
              <Title>{folderName}</Title>
              <Icon
                src={require('graphcool-styles/icons/fill/settings.svg')}
                width={23}
                height={23}
                onClick={this.props.onEditConfig}
                className={'settings-icon'}
              />
            </TitleRow>
            {Object.keys(endpoints).map(env => {
              const { endpoint } = getEndpointFromEndpointConfig(endpoints[env])
              const count = this.props.getSessionCount(endpoint)
              return (
                <ProjectsSideNavItem
                  key={env}
                  env={env}
                  onSelectEnv={onSelectEnv}
                  activeEnv={activeEnv}
                  count={count}
                />
              )
            })}
          </div>
        </List>
        {this.props.showNewWorkspace && (
          <Footer>
            <WorkspaceButton onClick={onNewWorkspace}>
              <Icon
                src={require('graphcool-styles/icons/stroke/addFull.svg')}
                stroke={true}
                color={$v.darkBlue}
                width={14}
                height={14}
                strokeWidth={6}
              />
              NEW WORKSPACE
            </WorkspaceButton>
          </Footer>
        )}
      </SideNav>
    )
  }
}

const textColor = theme('mode', {
  light: p => p.theme.colours.darkBlue,
  dark: p => p.theme.colours.white,
})

const backgroundColor = theme('mode', {
  light: p => p.theme.colours.white70,
  dark: p => p.theme.colours.darkBlue,
})

const darkerBackgroundColor = theme('mode', {
  light: p => p.theme.colours.white20,
  dark: p => p.theme.colours.darkerBlue,
})

const borderColor = theme('mode', {
  light: p => p.theme.colours.white20,
  dark: p => p.theme.colours.darkestBlue,
})

const footerBackgroundColor = theme('mode', {
  light: p => '#eeeff0',
  dark: p => p.theme.colours.darkBlue,
})

const buttonFontColor = theme('mode', {
  light: p => '#eeeff0',
  dark: p => p.theme.colours.darkBlue,
})

const buttonBackgroundColor = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => '#B9BFC4',
})

const buttonHoverBackgroundColor = theme('mode', {
  light: p => darken(0.1, p.theme.colours.darkBlue60),
  dark: p => darken(0.1, '#B9BFC4'),
})

const iconColor = theme('mode', {
  light: p => p.theme.colours.darkBlue20,
  dark: p => p.theme.colours.white20,
})

const iconColorActive = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => p.theme.colours.white60,
})

const SideNav = styled.div`
  position: relative;
  background: ${backgroundColor};
  flex: 0 222px;
  color: ${textColor};

    @p: .white, .relative, .bgDarkBlue;
    border-right: 6px solid ${borderColor};
  }
  .left-content.light {
    @p: .bgWhite70, .black60;
  }
`

// TODO fix typing
const List = styled.div`
  padding-top: ${(p: any) => (p.isEelectron ? 48 : 20)}px;
  padding-bottom: 32px;
  max-width: 222px;
  overflow: hidden;
  background: ${darkerBackgroundColor};
` as any

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 10px;
  padding-bottom: 22px;
  justify-content: space-between;

  .settings-icon {
    cursor: pointer;
  }

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

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: ${footerBackgroundColor};
`

const WorkspaceButton = styled.button`
  padding: 10px;
  display: flex;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.53px;
  color: ${buttonFontColor};
  background-color: ${buttonBackgroundColor};
  transition: 0.1s linear all;
  &:hover {
    background-color: ${buttonHoverBackgroundColor};
  }
  i {
    margin-right: 6px;
  }
  svg {
    stroke: ${buttonFontColor};
  }
`
