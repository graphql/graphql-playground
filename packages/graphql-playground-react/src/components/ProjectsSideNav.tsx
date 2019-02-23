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
        <List isElectron={isElectron}>
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

const SideNav = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${p => p.theme.editorColours.sidebar};
  flex-basis: 222px;
  color: ${p => p.theme.editorColours.text};
  border-right: 6px solid ${p => p.theme.editorColours.background};
`

const List = styled.div`
  -webkit-app-region: drag;
  padding-top: ${(p: any) => (p.isElectron ? 48 : 20)}px;
  display: flex;
  flex-direction: column;
  background: ${p => p.theme.editorColours.sidebarTop};
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${p => p.theme.editorColours.text};
  word-break: break-word;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin: 0 15px 20px 15px;
  svg {
    min-width: 18px;
    min-height: 18px;
    cursor: pointer;
    fill: ${p => p.theme.editorColours.icon};
    transition: 0.1s linear fill;
  }
  &:hover {
    svg {
      fill: ${p => p.theme.editorColours.iconHover};
    }
  }
`

const Project = styled.div`
  display: flex;
  flex-direction: column;
  & + & {
    margin-top: 12px;
  }
  &:last-child {
    margin-bottom: 32px;
  }
`

const ProjectName = styled.div`
  font-size: 14px;
  color: ${p => p.theme.editorColours.text};
  font-weight: 600;
  letter-spacing: 0.53px;
  margin: 0 10px 6px 30px;
  word-break: break-word;
`

const Footer = styled.div`
  display: flex;
  justify-content: center;
  margin: 32px 0;
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
    min-width: 18px;
    min-height: 18px;
    stroke: ${p => p.theme.editorColours.buttonWorkspaceText};
  }
`
