import * as React from 'react'
import { GraphQLConfigEnpointsMapData } from '../graphqlConfig'
import * as cx from 'classnames'
import ProjectsSideNavItem from './ProjectsSideNavItem'
import { Icon } from 'graphcool-styles'

export interface Props {
  endpoints: GraphQLConfigEnpointsMapData
  folderName: string
  theme: string
  activeEnv: string
  onSelectEnv: (endpoint: string) => void
  onNewWorkspace: () => void
}

export default class ProjectsSideNav extends React.Component<Props, {}> {
  render() {
    const {
      theme,
      endpoints,
      activeEnv,
      folderName,
      onSelectEnv,
      onNewWorkspace,
    } = this.props
    return (
      <div className={cx('left-content', theme)}>
        <style jsx={true}>{`
          .left-content {
            @p: .white, .relative, .mr6, .bgDarkBlue40, .bgDarkestBlue;
            flex: 0 222px;
            padding-top: 57px;
          }
          .left-content.light {
            @p: .bgWhite70, .black60;
          }
          .list {
            @p: .overflowHidden;
            max-width: 222px;
          }
          .left-content .list-item {
            @p: .pv10, .ph25, .fw6, .toe, .overflowHidden, .nowrap;
          }
          .left-content .list-item.list-item-project {
            @p: .pointer, .pl38, .f12;
          }
          .left-content .list-item.list-item-project.active {
            @p: .bgDarkBlue, .bGreen;
            border-left-style: solid;
            border-left-width: 4px;
            padding-left: 34px;
          }
          .left-content.light .list-item.list-item-project.active {
            background-color: #e7e8ea;
          }
          .playground {
            @p: .flex1;
          }
          .sidenav-footer {
            @p: .absolute, .bottom0, .w100, .flex, .itemsCenter, .justifyBetween,
              .pv20, .bgDarkBlue;
          }
          .light .sidenav-footer {
            background-color: #eeeff0;
          }
          .sidenav-footer .button {
            @p: .br2, .black90, .pointer, .pa10, .fw6, .flex, .itemsCenter,
              .ml20;
          }
        `}</style>
        <div className="list">
          <div>
            <div className={cx('list-item')}>{folderName}</div>
            {Object.keys(endpoints).map(env => (
              <ProjectsSideNavItem
                key={env}
                env={env}
                onSelectEnv={onSelectEnv}
                activeEnv={activeEnv}
              />
            ))}
          </div>
        </div>
        <div className="sidenav-footer">
          <button className="button" onClick={onNewWorkspace}>
            <Icon
              src={require('graphcool-styles/icons/stroke/add.svg')}
              stroke={true}
              color={$v.gray90}
              width={14}
              height={14}
              strokeWidth={6}
            />
            NEW WORKSPACE
          </button>
        </div>
      </div>
    )
  }
}
