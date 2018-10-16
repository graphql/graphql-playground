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
  position: relative;
  padding: 10px 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  padding-left: ${p => (p.deep ? '43px' : '38px')};
  padding-right: 10px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${p =>
    p.active ? p.theme.editorColours.sidebarItemActive : 'transparent'};

  &:before {
    content: '';
    border-radius: 2px;
    background: ${p =>
      p.active ? p.theme.editorColours.sidebarItemSide : 'transparent'};
    position: absolute;
    top: -2px;
    bottom: -2px;
    left: -2px;
    width: 6px;
  }

  &:hover {
    background: ${p => p.theme.editorColours.sidebarItemActive};
  }
`

const Count = styled<SidebarItemProps, 'div'>('div')`
  border-radius: 6px;
  width: 18px;
  height: 18px;
  line-height: 18px;
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
