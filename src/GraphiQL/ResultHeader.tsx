import * as React from 'react'
import ViewerChooser from './ResultHeader/ViewerChooser'
import {Viewer} from '../Playground'

interface Props {
  selectedViewer?: Viewer
  onChangeViewer?: Function
  showViewAs?: boolean
  showResponseTitle?: boolean
}

const ResultHeader = ({selectedViewer, onChangeViewer, showViewAs, showResponseTitle}: Props) => (
  <div className='result-header'>
    <style jsx={true}>{`
      .result-header {
        @inherit: .bgDarkBlue, .pa25, .flex, .justifyBetween, .itemsCenter;
      }
    `}</style>
    <div>
      {showResponseTitle && (
        <div className="editor-title">Response</div>
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
