import * as React from 'react'
import ViewerChooser from './ResultHeader/ViewerChooser'
import { Viewer } from '../types'
import * as cx from 'classnames'

export interface Props {
  selectedViewer?: Viewer
  onChangeViewer?: (data: any) => void
  showViewAs?: boolean
  showResponseTitle?: boolean
  showSelectUser?: boolean
}

const ResultHeader = ({
  selectedViewer,
  onChangeViewer,
  showViewAs,
  showResponseTitle,
  showSelectUser,
}: Props) =>
  <div className={cx('result-header subscription')}>
    <style jsx={true}>{`
      .result-header {
        @inherit: .bgDarkBlue,
          .flex,
          .justifyBetween,
          .itemsCenter,
          .relative,
          .pt25,
          .mh25,
          .pl16;
        height: 75px;
        &.subscription {
          &:after {
            content: "";
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            height: 25px;
            background: linear-gradient(
              to bottom,
              rgba(23, 42, 58, 1) 0%,
              rgba(23, 42, 58, 0) 100%
            );
            z-index: 4;
          }
        }
      }
      .inner {
        @inherit: .absolute;
      }
    `}</style>
    <div className="inner">
      <div>
        {showResponseTitle && <div className="editor-title">Response</div>}
      </div>
      {showViewAs &&
        selectedViewer &&
        onChangeViewer &&
        <ViewerChooser
          showSelectUser={showSelectUser}
          selectedViewer={selectedViewer}
          onChangeViewer={onChangeViewer}
        />}
    </div>
  </div>

export default ResultHeader
