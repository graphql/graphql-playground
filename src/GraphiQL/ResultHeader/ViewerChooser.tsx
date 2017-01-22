import * as React from 'react'
import * as cx from 'classnames'
import {Viewer} from '../../types'
import {Icon, $v} from 'graphcool-styles'

interface Props {
  selectedViewer: Viewer
  onChangeViewer: Function
}

const ViewAs = ({selectedViewer, onChangeViewer}: Props) => (
  <div className='root'>
    <style jsx={true}>{`
      .root {
        @inherit: .fw6, .flex, .itemsCenter;
        color: rgba(255,255,255,.25);
      }

      .chooser {
        @inherit: .ml16, .flex, .itemsCenter;
      }

      .viewer {
        padding: 5px 13px 6px 13px;
        margin: 0 -2px;
        @inherit: .br2, .relative, .pointer, .ttu, .flex, .itemsCenter;
        background-color: #08131B;
        &.active {
          padding: 7px 9px 8px 9px;
          background-color: rgb(185,191,196);
          color: rgb(15,32,46);
          z-index: 2;
        }
      }

      .viewer-text {
        @inherit: .ml6;
      }
    `}</style>

    <div>View As</div>
    <div className='chooser'>
      <div
        className={cx('viewer', {
          'active': selectedViewer === 'ADMIN',
        })}
        onClick={() => onChangeViewer('ADMIN')}
      >
        Admin
      </div>
      <div
        className={cx('viewer', {
          'active': selectedViewer === 'EVERYONE',
        })}
        onClick={() => onChangeViewer('EVERYONE')}
      >
        <Icon
          src={require('graphcool-styles/icons/fill/world.svg')}
          color={
            selectedViewer === 'EVERYONE' ? $v.darkerBlue : $v.white30
          }
          width={14}
          height={14}
        />
        <div className='viewer-text'>Everyone</div>
      </div>
      <div
        className={cx('viewer', {
          'active': selectedViewer === 'USER',
        })}
        onClick={() => onChangeViewer('USER')}
      >
        <Icon
          src={require('graphcool-styles/icons/fill/user.svg')}
          color={
            selectedViewer === 'USER' ? $v.darkerBlue : $v.white30
          }
          width={14}
          height={14}
        />
        <div className='viewer-text'>Select User</div>
      </div>
    </div>
  </div>
)

export default ViewAs
