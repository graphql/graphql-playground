import * as React from 'react'
import { Session } from '../types'
import { Icon, $v } from 'graphcool-styles'
import * as cx from 'classnames'

export interface Props {
  items: Session[]
  selectedItemIndex: number
  onItemSelect: (index: number) => void
  onItemStarToggled: (item: Session) => void
  searchTerm: string
}

const HistoryItems = ({
  items,
  onItemSelect,
  selectedItemIndex,
  onItemStarToggled,
}: Props) =>
  <div className="history-items">
    <style jsx={true}>{`
      .history-items {
        @inherit: .overflowYScroll;
        max-height: calc(100vh - 121px);
      }
      .item {
        @inherit: .flex,
          .itemsCenter,
          .justifyBetween,
          .bb,
          .bBlack10,
          .pointer;
        padding: 25px 20px;
        &.active {
          @inherit: .bgBlack04;
        }
      }
      .operation,
      .star,
      .viewer,
      .left,
      .right {
        @inherit: .flex, .itemsCenter;
      }
      .operation {
        @inherit: .itemsCenter;
        margin-left: 20px;
      }
      .operation-text {
        @inherit: .fw3, .f20, .mr16;
      }
      .operation-icon {
        @inherit: .br2, .flex, .itemsCenter, .justifyCenter, .mr4, .fw7, .f12;
        height: 21px;
        width: 21px;
        &.subscription {
          @inherit: .purple, .bgPurple20;
        }
        &.query {
          @inherit: .blue, .bgBlue20;
        }
        &.mutation {
          @inherit: .lightOrange, .bgLightOrange20;
        }
      }
      .date {
        @inherit: .f14, .black50, .ml16;
      }
      .viewer {
        @inherit: .ml6;
      }
    `}</style>
    {items.map((item, index) =>
      <div
        key={item.id}
        className={cx('item', {
          active: selectedItemIndex === index,
        })}
        onClick={() => onItemSelect(index)}
      >
        <div className="left">
          <div className="star" onClick={() => onItemStarToggled(item)}>
            <Icon
              src={require('../assets/icons/star.svg')}
              color={item.starred ? 'rgb(221,171,0)' : $v.gray30}
              stroke={!item.starred}
              strokeWidth={0.5}
              width={25}
              height={25}
            />
          </div>
          <div className="operation">
            <div className="operation-text">
              {item.operationName ||
                item.queryTypes.firstOperationName ||
                'New Session'}
            </div>
            {item.queryTypes.query &&
              <div className="operation-icon query">Q</div>}
            {item.queryTypes.mutation &&
              <div className="operation-icon mutation">M</div>}
            {item.queryTypes.subscription &&
              <div className="operation-icon subscription">S</div>}
            <div className="viewer">
              {item.selectedViewer === 'EVERYONE' &&
                <Icon
                  src={require('graphcool-styles/icons/fill/world.svg')}
                  color={$v.gray30}
                  width={18}
                  height={18}
                />}
              {item.selectedViewer === 'USER' &&
                <Icon
                  src={require('graphcool-styles/icons/fill/user.svg')}
                  color={$v.gray30}
                  width={18}
                  height={18}
                />}
            </div>
          </div>
        </div>
        <div className="right">
          {item.date &&
            <div className="date">
              {item.date.getMonth() + 1}/{item.date.getDay()}/{item.date.getFullYear().toString().slice(2, 4)}
            </div>}
        </div>
      </div>,
    )}
  </div>

export default HistoryItems
