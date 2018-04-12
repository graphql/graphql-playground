import * as React from 'react'
import * as cx from 'classnames'
import { styled } from '../styled/index'
import * as theme from 'styled-theming'

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
      <ListItem className={cx({ active, deep })} onClick={this.selectEndpoint}>
        <span>{env}</span>
        <Count className={cx('count', { active })}>{count}</Count>
      </ListItem>
    )
  }

  private selectEndpoint = () => {
    this.props.onSelectEnv(this.props.env, this.props.projectName)
  }
}

const textColor = theme('mode', {
  light: p => p.theme.colours.darkBlue80,
  dark: p => p.theme.colours.white,
})

const backgroundColor = theme('mode', {
  light: p => p.theme.colours.lighterGrey,
  dark: p => p.theme.colours.darkBlue,
})

const ListItem = styled.div`
  padding: 10px 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  padding-left: 38px;
  padding-right: 10px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.deep {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 43px;
    padding-right: 10px;
  }
  &.active {
    background: ${backgroundColor};
    position: relative;
    &:before {
      content: '';
      border-radius: 2px;
      background: ${p => p.theme.colours.green};
      position: absolute;
      top: -2px;
      bottom: -2px;
      left: -2px;
      width: 6px;
    }
  }
  &:hover {
    background: ${backgroundColor};
    .count {
      color: ${textColor};
    }
  }
`

const Count = styled.div`
  border-radius: 6px;
  width: 18px;
  height: 18px;
  line-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.05);
  color: ${textColor};
  opacity: 0.6;
  transition: 0.1s linear all;
  &.active {
    opacity: 1;
  }
`
