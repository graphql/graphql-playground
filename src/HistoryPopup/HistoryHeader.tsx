import * as React from 'react'
import HistoryChooser from './HistoryChooser'
import {HistoryFilter} from '../types'
import SearchBox from '../GraphiQL/DocExplorer/SearchBox'

interface Props {
  selectedFilter: HistoryFilter
  onSelectFilter: Function
  onSearch: (value: string) => void
}

const HistoryHeader = (props: Props) => (
  <div className='history-header'>
    <style jsx>{`
      .history-header {
        @inherit: .pa16, .flex, .justifyBetween, .itemsCenter;
        background-color: rgba(0,0,0,.02);
      }

      .search-box {
        padding: 0;
        background-color: transparent;
      }
    `}</style>
    <HistoryChooser
      onSelectFilter={props.onSelectFilter}
      selectedFilter={props.selectedFilter}
    />
    <SearchBox
      placeholder='Search the history...'
      onSearch={props.onSearch}
      clean
      isShown
    />
  </div>
)

export default HistoryHeader