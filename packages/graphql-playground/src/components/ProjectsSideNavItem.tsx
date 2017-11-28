import * as React from 'react'
import * as cx from 'classnames'

export interface Props {
  env: string
  onSelectEnv: (env: string) => void
  activeEnv: string
}

export default class ProjectsSideNavItem extends React.Component<Props, {}> {
  render() {
    const { env, activeEnv } = this.props
    return (
      <div
        className={cx('list-item list-item-project', {
          active: activeEnv === env,
        })}
        onClick={this.selectEndpoint}
      >
        <style jsx={true}>{`
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
        `}</style>
        {env}
      </div>
    )
  }

  private selectEndpoint = () => {
    this.props.onSelectEnv(this.props.env)
  }
}
