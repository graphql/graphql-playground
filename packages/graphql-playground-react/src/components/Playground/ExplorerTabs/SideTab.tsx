import * as React from 'react'
import { styled } from '../../../styled'

export interface Props {
  label: string
  activeColor: string
  children: any
  active?: boolean
  tabWidth?: string
  onClick?: () => any
}

export default class SideTab extends React.PureComponent<Props> {
  render() {
    const { label, activeColor, active, onClick, tabWidth } = this.props
    return (
      <Tab
        onClick={onClick}
        activeColor={activeColor}
        active={active}
        tabWidth={tabWidth}
      >
        {label}
      </Tab>
    )
  }
}

export interface TabProps {
  active: boolean
  activeColor: string
}

const Tab = styled<TabProps, 'div'>('div')`
  z-index: ${p => (p.active ? 10 : 2)};
  padding: 8px 8px 8px 8px;
  border-radius: 2px 2px 0px 0px;
  color: ${p =>
    p.theme.mode === 'dark'
      ? p.theme.colours.white
      : p.theme.colours[p.active ? 'white' : 'darkBlue']};
  background: ${p =>
    p.active && p.activeColor
      ? p.theme.colours[p.activeColor]
      : p.theme.mode === 'dark'
        ? '#3D5866'
        : '#DBDEE0'};
  box-shadow: -1px 1px 6px 0 rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.45px;
  cursor: pointer;
  transform: rotate(-90deg);
  transform-origin: bottom left;
  margin-top: 65px;
  width: ${p => p.tabWidth || '100%'};
`
