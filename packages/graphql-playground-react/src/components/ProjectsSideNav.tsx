import * as React from 'react'
import { GraphQLConfig, GraphQLConfigEnpointsMapData } from '../graphqlConfig'
import ProjectsSideNavItem from './ProjectsSideNavItem'
import { SettingsIcon, AddFullIcon } from './Icons'
import { styled } from '../styled/index'
import { getEndpointFromEndpointConfig } from './util'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { getSessionCounts } from '../state/workspace/reducers'
import { Map } from 'immutable'
import { getWorkspaceId } from './Playground/util/getWorkspaceId'
import { openConfigTab } from '../state/sessions/actions'

export interface Props {
  config: GraphQLConfig
  folderName: string
  theme: string
  activeEnv: string
  onSelectEnv: (endpoint: string, projectName?: string) => void
  onNewWorkspace?: () => void
  showNewWorkspace: boolean
  isElectron: boolean
  activeProjectName?: string
  configPath?: string
}

export interface ReduxProps {
  counts: Map<string, number>
  openConfigTab: () => void
}

class ProjectsSideNav extends React.Component<Props & ReduxProps, {}> {
  render() {
    const { config, folderName, onNewWorkspace, isElectron } = this.props
    const endpoints = config.extensions && config.extensions.endpoints
    const projects = config.projects
    return (
      <SideNav>
        <DraggableHeader isElectron={isElectron} />
        <List>
          <div>
            <TitleRow>
              <Title>{folderName}</Title>
              <SettingsIcon
                width={18}
                height={18}
                onClick={this.props.openConfigTab}
                title="Project settings"
              />
            </TitleRow>
            {endpoints && this.renderEndpoints(endpoints)}
            {projects &&
              Object.keys(projects).map(projectName => {
                const project = projects[projectName]
                const projectEndpoints =
                  project.extensions && project.extensions.endpoints
                if (!projectEndpoints) {
                  return null
                }

                return (
                  <Project key={projectName}>
                    <ProjectName>{projectName}</ProjectName>
                    {this.renderEndpoints(projectEndpoints, projectName)}
                  </Project>
                )
              })}
          </div>
        </List>
        {isElectron && (
          <Footer>
            <WorkspaceButton onClick={onNewWorkspace}>
              <AddFullIcon width={14} height={14} strokeWidth={6} />
              NEW WORKSPACE
            </WorkspaceButton>
          </Footer>
        )}
      </SideNav>
    )
  }

  private renderEndpoints(
    endpoints: GraphQLConfigEnpointsMapData,
    projectName?: string,
  ) {
    return Object.keys(endpoints).map(env => {
      const { endpoint } = getEndpointFromEndpointConfig(endpoints[env])
      const count =
        this.props.counts.get(
          getWorkspaceId({
            endpoint,
            configPath: this.props.configPath,
            workspaceName: projectName,
          }),
        ) || 1
      return (
        <ProjectsSideNavItem
          key={env}
          env={env}
          onSelectEnv={this.props.onSelectEnv}
          activeEnv={this.props.activeEnv}
          count={count}
          deep={Boolean(projectName)}
          projectName={projectName}
          activeProjectName={this.props.activeProjectName}
        />
      )
    })
  }
}

const mapStateToProps = createStructuredSelector({
  counts: getSessionCounts,
})

export default connect(
  mapStateToProps,
  { openConfigTab },
)(ProjectsSideNav)

const Project = styled.div`
  margin-bottom: 12px;
`

const SideNav = styled.div`
  position: relative;
  background: ${p => p.theme.editorColours.sidebar};
  flex: 0 222px;
  color: ${p => p.theme.editorColours.text};
  border-right: 6px solid ${p => p.theme.editorColours.background};
`

const DraggableHeader = styled.div`
  padding-top: ${(p: any) => (p.isElectron ? 48 : 20)}px;
  background: ${p => p.theme.editorColours.sidebarTop};
  -webkit-app-region: drag;
  max-width: 222px;
  overflow: hidden;
` as any

const List = styled.div`
  padding-bottom: 32px;
  max-width: 222px;
  overflow: hidden;
  background: ${p => p.theme.editorColours.sidebarTop};
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.editorColours.text};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 10px;
  padding-bottom: 20px;
  justify-content: space-between;

  svg {
    cursor: pointer;
  }

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

const ProjectName = styled.div`
  font-size: 14px;
  color: ${p => p.theme.editorColours.text};
  font-weight: 600;
  letter-spacing: 0.53px;
  margin-left: 30px;
  margin-bottom: 6px;
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
  background: ${p => p.theme.editorColours.sidebarBottom};
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
  color: ${p => p.theme.editorColours.buttonWorkspaceText};
  background-color: ${p => p.theme.editorColours.buttonWorkspace};
  transition: 0.1s linear all;
  &:hover {
    background-color: ${p => p.theme.editorColours.buttonWorkspaceHover};
  }
  i {
    margin-right: 6px;
  }
  svg {
    stroke: ${p => p.theme.editorColours.buttonWorkspaceText};
  }
`
