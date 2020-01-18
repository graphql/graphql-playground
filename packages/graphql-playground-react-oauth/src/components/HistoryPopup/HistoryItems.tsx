import * as React from 'react'
import { Session } from '../../state/sessions/reducers'
import { OrderedMap } from 'immutable'
import { Star } from '../Icons'
import { styled, withTheme, ThemeInterface } from '../../styled'

export interface Props {
  items: OrderedMap<string, Session>
  selectedItemIndex: string
  onItemSelect: (index: string) => void
  onItemStarToggled: (sessionId: string) => void
  searchTerm: string
  theme: ThemeInterface
}

/* tslint:disable */
export default withTheme(
  ({
    items,
    onItemSelect,
    selectedItemIndex,
    onItemStarToggled,
    theme,
  }: Props) => (
    <HistoryItems>
      {items
        .map((item, index) => (
          <HistoryItem
            key={item.id}
            active={selectedItemIndex === index}
            onClick={() => onItemSelect(index)}
          >
            <OperationSide>
              <Star
                onClick={() => onItemStarToggled(item.id)}
                stroke={!item.starred ? 'rgb(221,171,0)' : undefined}
                fill={item.starred ? 'rgb(221,171,0)' : undefined}
                strokeWidth={0.5}
                width={25}
                height={25}
              />
              <Operation>
                <OperationText>
                  {item.operationName ||
                    item.queryTypes.firstOperationName ||
                    'New Session'}
                </OperationText>
                {item.queryTypes.query && <QueryIcon>Q</QueryIcon>}
                {item.queryTypes.mutation && <MutationIcon>M</MutationIcon>}
                {item.queryTypes.subscription && (
                  <SubscriptionIcon>S</SubscriptionIcon>
                )}
              </Operation>
            </OperationSide>
            <OperationSide>
              {item.date && (
                <Time>
                  {typeof item.date.getMonth === 'function' &&
                    item.date.getMonth() + 1}/{item.date.getDate()}/{item.date
                    .getFullYear()
                    .toString()
                    .slice(2, 4)}
                </Time>
              )}
            </OperationSide>
          </HistoryItem>
        ))
        .toArray()
        .map(x => x[1])}
    </HistoryItems>
  ),
)

const HistoryItems = styled.div`
  overflow-y: scroll;
  max-height: calc(100vh - 121px);
`

interface ItemProps {
  active: boolean
}

const HistoryItem = styled<ItemProps, 'div'>('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 20px;
  cursor: pointer;
  border-bottom: 1px solid;
  border-color: ${p => p.theme.colours.black10};
  background: ${p =>
    p.active ? p.theme.colours.black04 : p.theme.colours.white};
`

const Operation = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
`

const OperationSide = styled.div`
  display: flex;
  align-items: center;
`

const OperationText = styled.p`
  font-weight: 300;
  font-size: 20px;
  margin-right: 16px;
`

const OperationIcon = styled.div`
  height: 21px;
  width: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;
  border-radius: 2px;
  font-weight: 700;
  font-size: 12px;
  color: ${p => p.theme.colours.white};
`

const QueryIcon = styled(OperationIcon)`
  background: ${p => p.theme.colours.blue};
`

const MutationIcon = styled(OperationIcon)`
  background: ${p => p.theme.colours.orange};
`

const SubscriptionIcon = styled(OperationIcon)`
  background: ${p => p.theme.colours.purple};
`

const Time = styled.time`
  color: ${p => p.theme.colours.black40};
  font-size: 14px;
  margin-left: 16px;
`
