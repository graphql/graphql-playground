import * as React from 'react'
import { Icon, $v } from 'graphcool-styles'
import { HistoryFilter } from '../../types'
import * as cx from 'classnames'

export interface Props {
  selectedFilter: HistoryFilter
  onSelectFilter: (filter: any) => void
}

const HistoryChooser = ({ selectedFilter, onSelectFilter }: Props) =>
  <div>
    <style jsx={true}>{`
      .chooser {
        @inherit: .flex, .itemsCenter;
      }

      .filter {
        @inherit: .br2,
          .relative,
          .pointer,
          .ttu,
          .flex,
          .itemsCenter,
          .black30,
          .fw6,
          .f14,
          .bgBlack07,
          .cbox;
        padding: 5px 13px 6px 13px;
        margin: 0 -2px;
        height: 24px;
        &.active {
          @inherit: .z2, .white, .bgGreen;
          padding: 7px 9px 8px 9px;
        }
      }

      .filter-text {
        @inherit: .ml6;
      }
    `}</style>
    <div className="chooser">
      <div
        className={cx('filter', {
          active: selectedFilter === 'HISTORY',
        })}
        onClick={() => onSelectFilter('HISTORY')}
      >
        <Icon
          src={require('graphcool-styles/icons/stroke/history.svg')}
          color={selectedFilter === 'HISTORY' ? $v.white : $v.gray30}
          stroke={true}
          strokeWidth={3}
          width={25}
          height={25}
        />
        <div className="filter-text">History</div>
      </div>
      <div
        className={cx('filter', {
          active: selectedFilter === 'STARRED',
        })}
        onClick={() => onSelectFilter('STARRED')}
      >
        <Icon
          src={require('../../assets/icons/star.svg')}
          color={selectedFilter === 'STARRED' ? $v.white : $v.gray30}
          width={16}
          height={16}
        />
        <div className="filter-text">Starred</div>
      </div>
    </div>
  </div>

export default HistoryChooser
