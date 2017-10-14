import * as React from 'react'
import * as cx from 'classnames'
import { Viewer } from '../../../types'
import { Icon, $v } from 'graphcool-styles'

export interface Props {
  selectedViewer: Viewer
  onChangeViewer: (data: any) => void
  showSelectUser?: boolean
}

export default class ViewAs extends React.Component<Props, {}> {
  render() {
    const { selectedViewer, showSelectUser } = this.props
    return (
      <div className="root">
        <style jsx={true}>{`
          .root {
            @p: .fw6, .flex, .itemsCenter;
            color: rgba(255, 255, 255, .25);
          }

          .chooser {
            @p: .ml16, .flex, .itemsCenter;
          }

          .viewer {
            @p: .br2, .relative, .pointer, .ttu, .flex, .itemsCenter;
            padding: 5px 13px 6px 13px;
            margin: 0 -2px;
            background-color: #08131b;
            &.active {
              @p: .bgLightGray, .darkerBlue;
              padding: 7px 9px 8px 9px;
              z-index: 2;
            }
          }

          .viewer-text {
            @p: .ml6, .nowrap;
          }
        `}</style>

        <div className="nowrap">View As</div>
        <div className="chooser">
          <div
            className={cx('viewer', {
              active: selectedViewer === 'ADMIN',
            })}
            onClick={this.handleChangeAdminViewer}
          >
            Admin
          </div>
          <div
            className={cx('viewer', {
              active: selectedViewer === 'EVERYONE',
            })}
            onClick={this.handleChangeEveryoneViewer}
          >
            <Icon
              src={require('graphcool-styles/icons/fill/world.svg')}
              color={selectedViewer === 'EVERYONE' ? $v.darkerBlue : $v.white30}
              width={14}
              height={14}
            />
            <div className="viewer-text">Everyone</div>
          </div>
          {showSelectUser &&
            <div
              className={cx('viewer', {
                active: selectedViewer === 'USER',
              })}
              onClick={this.handleChangeUserViewer}
            >
              <Icon
                src={require('graphcool-styles/icons/fill/user.svg')}
                color={selectedViewer === 'USER' ? $v.darkerBlue : $v.white30}
                width={14}
                height={14}
              />
              <div className="viewer-text">Select User</div>
            </div>}
        </div>
      </div>
    )
  }

  private handleChangeAdminViewer = () => {
    this.props.onChangeViewer('ADMIN')
  }

  private handleChangeEveryoneViewer = () => {
    this.props.onChangeViewer('EVERYONE')
  }

  private handleChangeUserViewer = () => {
    this.props.onChangeViewer('USER')
  }
}
