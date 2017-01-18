import * as React from 'react'
import ViewerChooser from './ResultHeader/ViewerChooser'
import {Viewer} from '../Playground'

interface Props {
  selectedViewer: Viewer
  onChangeViewer: Function
}

const ResultHeader = ({selectedViewer, onChangeViewer}: Props) => (
  <div className='root'>
    <style jsx={true}>{`
      .root {
        @inherit: .bgDarkBlue, .pa25, .flex, .justifyEnd, .itemsCenter;
      }
    `}</style>
    <ViewerChooser
      selectedViewer={selectedViewer}
      onChangeViewer={onChangeViewer}
    />
  </div>
)

export default ResultHeader
