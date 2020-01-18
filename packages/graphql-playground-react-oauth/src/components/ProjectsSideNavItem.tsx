import * as React from 'react'
import { styled } from '../styled/index'

export interface Props {
  env: string
  onSelectEnv: (env: string, projectName?: string) => void
  activeEnv: string
  count: number
  deep: boolean
  projectName?: string
  activeProjectName?: string
}

export default class ProjectsSideNavItem extends React.Component<Props, {}> {
  render() {
    const {
      env,
      activeEnv,
      count,
      deep,
      activeProjectName,
      projectName,
    } = this.props
    const active = activeEnv === env && activeProjectName === projectName

    return (
      <ListItem active={active} deep={deep} onClick={this.selectEndpoint}>
        <span>{env}</span>
        <Count active={active}>{count}</Count>
      </ListItem>
    )
  }

  private selectEndpoint = () => {
    this.props.onSelectEnv(this.props.env, this.props.projectName)
  }
}

interface SidebarItemProps {
  active: boolean
  deep?: boolean
}

const ListItem = styled<SidebarItemProps, 'div'>('div')`
  padding: 10px 10px 10px ${p => (p.deep ? '43px' : '38px')};
  word-break: break-word;
  font-weight: 600;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${p =>
    p.active ? p.theme.editorColours.sidebarItemActive : 'transparent'};
  border-left: 4px solid
    ${p => (p.active ? p.theme.editorColours.sidebarItemSide : 'transparent')};
  border-radius: 2px;

  &:hover {
    background: ${p => p.theme.editorColours.sidebarItemActive};
  }
`

const Count = styled<SidebarItemProps, 'div'>('div')`
  border-radius: 6px;
  min-width: 18px;
  min-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  background: ${p => p.theme.editorColours.sidebarItemSessions};
  color: ${p => p.theme.editorColours.text};
  opacity: ${p => (p.active ? 1 : 0.6)};
  transition: 0.1s linear all;
` as any
