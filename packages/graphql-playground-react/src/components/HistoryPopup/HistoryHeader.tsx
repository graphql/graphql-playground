import * as React from 'react'
import HistoryChooser from './HistoryChooser'
import { HistoryFilter } from '../../types'
import { styled } from '../../styled'
import SearchBox from '../Playground/DocExplorer/SearchBox'

export interface Props {
  selectedFilter: HistoryFilter
  onSelectFilter: (filter: any) => void
  onSearch: (value: string) => void
}

export default (props: Props) => (
  <HistoryHeader>
    <HistoryChooser
      onSelectFilter={props.onSelectFilter}
      selectedFilter={props.selectedFilter}
    />
    <SearchBox
      placeholder="Search the history..."
      onSearch={props.onSearch}
      clean={true}
    />
  </HistoryHeader>
)

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${p => p.theme.colours.black02};
`
