import * as React from 'react'
import * as Modal from 'react-modal'
import HistoryHeader from './HistoryPopup/HistoryHeader'
import {HistoryFilter, Session} from './types'
import HistoryItems from './HistoryPopup/HistoryItems'
import {CustomGraphiQL} from './GraphiQL/CustomGraphiQL'
import {SchemaCache} from './Playground'
import {$v, Icon} from 'graphcool-styles'

export interface Props {
  isOpen: boolean
  onRequestClose: Function
  historyItems: Session[]
  onItemStarToggled: (item: Session) => void
  fetcherCreater: Function
  schemas: SchemaCache
  onCreateSession: (session: Session) => void
}

export interface State {
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
    const {searchTerm, selectedFilter} = this.state
    const items = this.props.historyItems
      .filter(item => {
        return selectedFilter === 'STARRED' ? item.starred : true
          && (searchTerm && searchTerm.length > 0 ? item.query.toLowerCase().includes(searchTerm.toLowerCase()) : true)
      })

    const selectedItem = items[this.state.selectedItemIndex]
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel='GraphiQL Session History'
        style={{
          overlay: {
            zIndex: 20,
            backgroundColor: 'rgba(15,32,46,.9)',
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
            border: 'none',
            background: 'none',
            boxShadow: '0 1px 7px rgba(0,0,0,.2)',
          },
        }}
      >
        <style jsx>{`
          .history-popup {
            @inherit: .flex;
            min-height: 500px;
          }
          .left {
            @inherit: .flex1, .bgWhite;
            &:after {
              content: "";
              position: absolute;
              bottom: 0px;
              height: 50px;
              left: 0;
              right: 0;
              width: 100%;
              background: linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);
            }
          }
          .right {
            @inherit: .z2;
            flex: 0 0 464px;
          }
          .right-header {
            @inherit: .justifyBetween, .flex, .bgDarkBlue, .itemsCenter, .ph25;
            padding-top: 20px;
            padding-bottom: 20px;
          }
          .right-empty {
            @inherit: .bgDarkBlue, .h100, .flex, .justifyCenter, .itemsCenter;
          }
          .right-empty-text {
            @inherit: .f16, .white60;
          }
          .view {
            @inherit: .f14, .white40, .ttu, .fw6;
          }
          .use {
            @inherit: .f14, .fw6, .pv10, .ph16, .bgGreen, .flex, .br2, .itemsCenter, .pointer;
          }
          .use-text {
            @inherit: .mr6, .white;
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
              items={items}
              selectedItemIndex={this.state.selectedItemIndex}
              searchTerm={this.state.searchTerm}
              onItemSelect={this.handleItemSelect}
              onItemStarToggled={this.props.onItemStarToggled}
            />
          </div>
          {Boolean(selectedItem) ? (
            <div className='right'>
              <div className='right-header'>
                <div className='view'>
                  {`${selectedItem.selectedEndpoint} API / View as ${selectedItem.selectedViewer}`}
                </div>
                <div
                  className='use'
                  onClick={() => {
                    this.props.onCreateSession(selectedItem)
                    this.props.onRequestClose()
                  }}
                >
                  <div className='use-text'>
                    Use
                  </div>
                  <Icon
                    src={require('./assets/icons/arrowRight.svg')}
                    color={$v.white}
                    stroke
                    width={13}
                    height={13}
                  />
                </div>
              </div>
              <CustomGraphiQL
                schema={this.props.schemas[selectedItem.selectedEndpoint]}
                variables={selectedItem.variables}
                query={selectedItem.query}
                fetcher={this.props.fetcherCreater(selectedItem)}
                disableQueryHeader
                queryOnly
              />
            </div>
          ) : (
            <div className='right'>
              <div className='right-empty'>
                <div className='right-empty-text'>No History yet</div>
              </div>
            </div>
          )}
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
