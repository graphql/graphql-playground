import * as React from 'react'
import ViewerChooser from './ResultHeader/ViewerChooser'
import {Viewer} from '../types'
import * as cx from 'classnames'

interface Props {
  selectedViewer?: Viewer
  onChangeViewer?: Function
  showViewAs?: boolean
  showResponseTitle?: boolean
  subscriptionActive?: boolean
}

const ResultHeader = ({selectedViewer, onChangeViewer, showViewAs, showResponseTitle, subscriptionActive}: Props) => (
  <div
    className={cx(
      'result-header',
      {
        'subscription': subscriptionActive,
      },
    )}
  >
    <style jsx={true}>{`
      .result-header {
        @inherit: .bgDarkBlue, .pa25, .flex, .justifyBetween, .itemsCenter, .relative;
        &.subscription {
          &:after {
            content: "";
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            height: 40px;
            background: linear-gradient(to bottom, rgba(23,42,58,1) 10%,rgba(23,42,58,0) 100%);
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
