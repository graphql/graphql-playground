import * as React from 'react'
import * as cx from 'classnames'
import {Viewer} from '../../Playground'

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
        padding: 5px 12px 6px 12px;
        @inherit: .bgBlack50, .br2, .relative, .pointer, .ttu;
        &.active {
          padding: 7px 9px 8px 9px;
          background-color: rgb(185,191,196);
          color: rgb(15,32,46);
          margin: 0 -2px;
          z-index: 2;
        }
      }
    `}</style>

    <div>View As</div>
    <div className="chooser">
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
        Everyone
      </div>
      <div
        className={cx('viewer', {
          'active': selectedViewer === 'USER',
        })}
        onClick={() => onChangeViewer('USER')}
      >
        Select User
      </div>
    </div>
  </div>
)

export default ViewAs
