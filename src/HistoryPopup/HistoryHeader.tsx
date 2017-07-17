import * as React from 'react'
import HistoryChooser from './HistoryChooser'
import { HistoryFilter } from '../types'
import SearchBox from '../GraphiQL/DocExplorer/SearchBox'

export interface Props {
  selectedFilter: HistoryFilter
  onSelectFilter: (filter: any) => void
  onSearch: (value: string) => void
}

const HistoryHeader = (props: Props) =>
  <div className="history-header">
    <style jsx={true}>{`
      .history-header {
        @inherit: .pa16, .flex, .justifyBetween, .itemsCenter, .bgBlack02;
      }

      .search-box {
        @inherit: .pa0, .bgTransparent;
      }
    `}</style>
    <HistoryChooser
      onSelectFilter={props.onSelectFilter}
      selectedFilter={props.selectedFilter}
    />
    <SearchBox
      placeholder="Search the history..."
      onSearch={props.onSearch}
      clean={true}
      isShown={true}
    />
  </div>

export default HistoryHeader
