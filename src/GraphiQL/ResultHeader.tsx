import * as React from 'react'
import ViewerChooser from './ResultHeader/ViewerChooser'
import {Viewer} from '../types'
import * as cx from 'classnames'

interface Props {
  selectedViewer?: Viewer
  onChangeViewer?: Function
  showViewAs?: boolean
  showResponseTitle?: boolean
}

const ResultHeader = ({selectedViewer, onChangeViewer, showViewAs, showResponseTitle}: Props) => (
  <div
    className={cx(
      'result-header subscription',
    )}
  >
    <style jsx={true}>{`
      .result-header {
        @inherit: .bgDarkBlue, .flex, .justifyBetween, .itemsCenter, .relative, .pt25, .ph25;
        &.subscription {
          &:after {
            content: "";
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            height: 25px;
            background: linear-gradient(to bottom, rgba(23,42,58,1) 0%,rgba(23,42,58,0) 100%);
            z-index: 4;
          }
        }
      }
    `}</style>
    <div>
      {showResponseTitle && (
        <div className='editor-title'>Response</div>
      )}
    </div>
    {showViewAs && selectedViewer && onChangeViewer && (
      <ViewerChooser
        selectedViewer={selectedViewer}
        onChangeViewer={onChangeViewer}
      />
    )}
  </div>
)

export default ResultHeader
