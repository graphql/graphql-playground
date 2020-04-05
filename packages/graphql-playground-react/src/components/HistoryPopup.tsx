import * as React from 'react'
import * as Modal from 'react-modal'
import HistoryHeader from './HistoryPopup/HistoryHeader'
import { HistoryFilter } from '../types'
import HistoryItems from './HistoryPopup/HistoryItems'
import { modalStyle } from '../constants'
import { QueryEditor } from './Playground/QueryEditor'
import { styled } from '../styled'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getHistory } from '../state/history/selectors'
import { getHistoryOpen } from '../state/general/selectors'
import { closeHistory, openHistory } from '../state/general/actions'
import { duplicateSession } from '../state/sessions/actions'
import { toggleHistoryItemStarring } from '../state/history/actions'
import { Session } from '../state/sessions/reducers'
import { OrderedMap } from 'immutable'
import { Container } from './Playground/EditorWrapper'
import { ArrowRight } from './Icons'

export interface ReduxProps {
  isOpen: boolean
  closeHistory: () => void
  items: OrderedMap<string, Session>
  toggleHistoryItemStarring: (sessionId: string) => void
  duplicateSession: (session: Session) => void
}

export interface State {
  selectedFilter: HistoryFilter
  selectedItemIndex: string
  searchTerm: string
}

class HistoryPopup extends React.Component<ReduxProps, State> {
  constructor(props: ReduxProps) {
    super(props)
    const selectedItemIndex: any = props.items.keySeq().first() || ''
    this.state = {
      selectedFilter: 'HISTORY',
      selectedItemIndex,
      searchTerm: '',
    }
  }
  render() {
    const { searchTerm, selectedFilter } = this.state
    const items = this.props.items.filter(item => {
      return selectedFilter === 'STARRED'
        ? item.starred
        : true &&
            (searchTerm && searchTerm.length > 0
              ? item.query.toLowerCase().includes(searchTerm.toLowerCase())
              : true)
    })

    let selectedItem = this.props.items.get(
      this.state.selectedItemIndex!,
    ) as any
    selectedItem =
      selectedItem && selectedItem.toJS ? selectedItem.toJS() : undefined

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.closeHistory}
        contentLabel="GraphiQL Session History"
        style={modalStyle}
        ariaHideApp={false}
      >
        <Wrapper>
          <Left>
            <HistoryHeader
              onSelectFilter={this.handleSelectFilter}
              selectedFilter={this.state.selectedFilter}
              onSearch={this.handleSearch}
            />
            <HistoryItems
              items={items}
              selectedItemIndex={this.state.selectedItemIndex}
              searchTerm={this.state.searchTerm}
              onItemSelect={this.handleItemSelect}
              onItemStarToggled={this.props.toggleHistoryItemStarring}
            />
          </Left>
          {Boolean(selectedItem) ? (
            <Right>
              <RightHeader>
                <View />
                <Use onClick={this.handleClickUse}>
                  <UseText>Use</UseText>
                  <ArrowRight color="white" width={13} height={13} />
                </Use>
              </RightHeader>
              <Big>
                <GraphiqlWrapper>
                  <Container>
                    <QueryWrap>
                      <QueryEditor value={selectedItem.query} />
                    </QueryWrap>
                  </Container>
                </GraphiqlWrapper>
              </Big>
            </Right>
          ) : (
            <Right>
              <RightEmpty>
                <RightEmptyText>No History yet</RightEmptyText>
              </RightEmpty>
            </Right>
          )}
        </Wrapper>
      </Modal>
    )
  }

  private handleClickUse = () => {
    const { items } = this.props
    const selectedItem = items.get(this.state.selectedItemIndex)!
    this.props.duplicateSession(selectedItem)
    this.props.closeHistory()
  }

  private handleItemSelect = (index: string) => {
    this.setState({ selectedItemIndex: index } as State)
  }

  private handleSelectFilter = (filter: HistoryFilter) => {
    this.setState({ selectedFilter: filter } as State)
  }

  private handleSearch = (term: string) => {
    this.setState({ searchTerm: term } as State)
  }
}

const mapStateToProps = createStructuredSelector({
  items: getHistory,
  isOpen: getHistoryOpen,
})

export default connect(
  mapStateToProps,
  {
    closeHistory,
    openHistory,
    duplicateSession,
    toggleHistoryItemStarring,
  },
)(HistoryPopup)

const Wrapper = styled.div`
  display: flex;
  min-height: 500px;
`

const Left = styled.div`
  flex: 1;

  background: white;
`

const Right = styled.div`
  flex: 0 0 464px;
  z-index: 2;
`

const RightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-left: ${p => p.theme.sizes.medium25};
  padding-right: ${p => p.theme.sizes.medium25};
  padding-top: 20px;
  padding-bottom: 20px;

  background: ${p => p.theme.editorColours.resultBackground};
`

const RightEmpty = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${p => p.theme.editorColours.resultBackground};
`

const RightEmptyText = styled.div`
  font-size: 16px;
  color: ${p => p.theme.editorColours.text};
`

const View = styled.div`
  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontSemiBold};
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
`

const Use = styled.div`
  display: flex;
  align-items: center;

  padding-top: ${p => p.theme.sizes.small10};
  padding-bottom: ${p => p.theme.sizes.small10};
  padding-left: ${p => p.theme.sizes.small16};
  padding-right: ${p => p.theme.sizes.small16};

  font-size: ${p => p.theme.sizes.fontSmall};
  font-weight: ${p => p.theme.sizes.fontSemiBold};

  border-radius: ${p => p.theme.sizes.smallRadius};
  background: ${p => p.theme.colours.green};
  cursor: pointer;
`

const UseText = styled.div`
  margin-right: ${p => p.theme.sizes.small6};
  color: white;
`

const Big = styled.div`
  height: calc(100% - 81px);
  display: flex;
  flex: 1 1 auto;
`

const GraphiqlWrapper = styled(Big)`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex: 1 1 auto;
`

const QueryWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`
