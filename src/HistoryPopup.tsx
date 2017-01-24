import * as React from 'react'
import * as Modal from 'react-modal'
import HistoryHeader from './HistoryPopup/HistoryHeader'
import {HistoryFilter, Session} from './types'
import HistoryItems from './HistoryPopup/HistoryItems'

interface Props {
  isOpen: boolean
  onRequestClose: Function
  historyItems: Session[]
  onItemStarToggled: (item: Session) => void
}

interface State {
  selectedFilter: HistoryFilter
  selectedItemIndex: number
  searchTerm: string
}

export default class HistoryPopup extends React.Component<Props,State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedFilter: 'HISTORY',
      selectedItemIndex: 0,
      searchTerm: '',
    }
  }
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel='GraphiQL Session History'
        style={{
            overlay: {
              zIndex: 20,
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            content: {
              position: 'relative',
              width: 976,
              height: 'auto',
              top: 'initial',
              left: 'initial',
              right: 'initial',
              bottom: 'initial',
              borderRadius: 2,
              padding: 0,
            },
          }}
      >
        <style jsx>{`
          .history-popup {
            @inherit: .flex;
          }
          .left {
            @inherit: .flex1;
          }
          .right {
            flex: 0 0 464px;
          }
        `}</style>
        <div className='history-popup'>
          <div className='left'>
            <HistoryHeader
              onSelectFilter={this.handleSelectFilter}
              selectedFilter={this.state.selectedFilter}
              onSearch={this.handleSearch}
            />
            <HistoryItems
              items={this.props.historyItems}
              selectedItemIndex={this.state.selectedItemIndex}
              selectedFilter={this.state.selectedFilter}
              searchTerm={this.state.searchTerm}
              onItemSelect={this.handleItemSelect}
              onItemStarToggled={this.props.onItemStarToggled}
            />
          </div>
          <div className='right'></div>
        </div>
      </Modal>
    )
  }

  private handleItemSelect = (index: number) => {
    this.setState({selectedItemIndex: index} as State)
  }

  private handleSelectFilter = (filter: HistoryFilter) => {
    this.setState({selectedFilter: filter} as State)
  }

  private handleSearch = (term: string) => {
    this.setState({searchTerm: term} as State)
  }
}
