import * as React from 'react'
import { HistoryFilter } from '../../types'
import { styled, withTheme, ThemeInterface } from '../../styled'
import { Star, History } from '../Icons'

interface Props {
  theme: ThemeInterface
  selectedFilter: HistoryFilter
  onSelectFilter: (filter: any) => void
}

/* tslint:disable */

const HistoryChooser = ({ selectedFilter, onSelectFilter, theme }: Props) => (
  <Chooser>
    <Filter
      active={selectedFilter === 'HISTORY'}
      onClick={() => onSelectFilter('HISTORY')}
    >
      <History
        color={
          selectedFilter === 'HISTORY'
            ? theme.colours.white
            : theme.colours.black30
        }
        strokeWidth={3}
        width={25}
        height={25}
      />
      <FilterText>History</FilterText>
    </Filter>
    <Filter
      active={selectedFilter === 'STARRED'}
      onClick={() => onSelectFilter('STARRED')}
    >
      <Star
        color={
          selectedFilter === 'STARRED'
            ? theme.colours.white
            : theme.colours.black30
        }
        width={16}
        height={16}
      />
      <FilterText>Starred</FilterText>
    </Filter>
  </Chooser>
)

export default withTheme(HistoryChooser)

const Chooser = styled.div`
  display: flex;
  align-items: center;
`

interface FilterProps {
  active: boolean
}

const Filter = styled<FilterProps, 'div'>('div')`
  box-sizing: content-box;
  height: 24px;
  z-index: ${p => (p.active ? 2 : 0)};
  display: flex;
  align-items: center;
  margin: 0 -2px;
  padding: ${p => (p.active ? '7px 9px 8px 9px' : '5px 13px 6px 13px')};
  background: ${p =>
    p.active ? p.theme.colours.green : p.theme.colours.black07};

  color: ${p => (p.active ? p.theme.colours.white : p.theme.colours.black30)};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 2px;
  cursor: pointer;
`

const FilterText = styled.p`
  margin-left: 6px;
`
