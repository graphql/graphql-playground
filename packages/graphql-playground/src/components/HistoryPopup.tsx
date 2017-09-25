import * as React from 'react'
import * as Modal from 'react-modal'
import HistoryHeader from './HistoryPopup/HistoryHeader'
import { HistoryFilter, Session } from '../types'
import HistoryItems from './HistoryPopup/HistoryItems'
import { GraphQLEditor } from './Playground/GraphQLEditor'
import { $v, Icon } from 'graphcool-styles'
import { modalStyle } from '../constants'
import withTheme from './Theme/withTheme'
import * as cn from 'classnames'

export interface Props {
  isOpen: boolean
  onRequestClose: () => void
  historyItems: Session[]
  onItemStarToggled: (item: Session) => void
  fetcherCreater: (item: any, params: any) => Promise<any>
  schema: any
  onCreateSession: (session: Session) => void
  isGraphcool: boolean
}

interface Theme {
  theme: string
}

export interface State {
  selectedFilter: HistoryFilter
  selectedItemIndex: number
  searchTerm: string
}

class HistoryPopup extends React.Component<Props & Theme, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedFilter: 'HISTORY',
      selectedItemIndex: 0,
      searchTerm: '',
    }
  }
  render() {
    const { searchTerm, selectedFilter } = this.state
    const { theme } = this.props
    const items = this.props.historyItems.filter(item => {
      return selectedFilter === 'STARRED'
        ? item.starred
        : true &&
          (searchTerm && searchTerm.length > 0
            ? item.query.toLowerCase().includes(searchTerm.toLowerCase())
            : true)
    })

    const selectedItem = items[this.state.selectedItemIndex]
    const schema = this.props.schema
    let customModalStyle = modalStyle
    if (theme === 'light') {
      customModalStyle = {
        ...modalStyle,
        overlay: {
          ...modalStyle.overlay,
          backgroundColor: 'rgba(255,255,255,0.9)',
        },
      }
    }

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="GraphiQL Session History"
        style={customModalStyle}
      >
        <style jsx={true}>{`
          .history-popup {
            @p: .flex;
            min-height: 500px;
          }
          .left {
            @p: .flex1, .bgWhite;
            &:after {
              content: '';
              position: absolute;
              bottom: 0px;
              height: 50px;
              left: 0;
              right: 0;
              width: 100%;
              background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 1) 100%
              );
            }
          }
          .right {
            @p: .z2;
            flex: 0 0 464px;
          }
          .right-header {
            @p: .justifyBetween, .flex, .bgDarkBlue, .itemsCenter, .ph25;
            padding-top: 20px;
            padding-bottom: 20px;
          }
          .right-header.light {
            background-color: #f6f7f7;
          }
          .right-empty {
            @p: .bgDarkBlue, .h100, .flex, .justifyCenter, .itemsCenter;
          }
          .right-empty.light {
            background-color: #f6f7f7;
          }
          .right-empty-text {
            @p: .f16, .white60;
          }
          .view {
            @p: .f14, .white40, .ttu, .fw6;
          }
          .use {
            @p: .f14, .fw6, .pv10, .ph16, .bgGreen, .flex, .br2, .itemsCenter,
              .pointer;
          }
          .use-text {
            @p: .mr6, .white;
          }
          .graphiql-wrapper {
            @p: .w100, .h100, .relative, .flex, .flexAuto;
          }
          .big {
            @p: .h100, .flex, .flexAuto;
          }
        `}</style>
        <div className={cn('history-popup', theme)}>
          <div className="left">
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
          {Boolean(selectedItem)
            ? <div className={cn('right', theme)}>
                <div className={cn('right-header', theme)}>
                  <div className="view">
                    {this.props.isGraphcool &&
                      `View as ${selectedItem.selectedViewer}`}
                  </div>
                  <div className="use" onClick={this.handleClickUse}>
                    <div className="use-text">Use</div>
                    <Icon
                      src={require('../assets/icons/arrowRight.svg')}
                      color={$v.white}
                      stroke={true}
                      width={13}
                      height={13}
                    />
                  </div>
                </div>
                <div
                  className={cn('big', { 'docs-graphiql': theme === 'light' })}
                >
                  <div
                    className={cn('big', {
                      'graphiql-wrapper': theme === 'light',
                    })}
                  >
                    <GraphQLEditor
                      schema={schema}
                      variables={selectedItem.variables}
                      query={selectedItem.query}
                      fetcher={this.fetcher}
                      disableQueryHeader={true}
                      queryOnly={true}
                      rerenderQuery={true}
                    />
                  </div>
                </div>
              </div>
            : <div className={cn('right', theme)}>
                <div className={cn('right-empty', theme)}>
                  <div className="right-empty-text">No History yet</div>
                </div>
              </div>}
        </div>
      </Modal>
    )
  }

  private handleClickUse = () => {
    const { searchTerm, selectedFilter } = this.state
    // TODO refactor
    const items = this.props.historyItems.filter(item => {
      return selectedFilter === 'STARRED'
        ? item.starred
        : true &&
          (searchTerm && searchTerm.length > 0
            ? item.query.toLowerCase().includes(searchTerm.toLowerCase())
            : true)
    })
    const selectedItem = items[this.state.selectedItemIndex]
    this.props.onCreateSession(selectedItem)
    this.props.onRequestClose()
  }

  private fetcher = params => {
    const { searchTerm, selectedFilter } = this.state
    const items = this.props.historyItems.filter(item => {
      return selectedFilter === 'STARRED'
        ? item.starred
        : true &&
          (searchTerm && searchTerm.length > 0
            ? item.query.toLowerCase().includes(searchTerm.toLowerCase())
            : true)
    })
    const selectedItem = items[this.state.selectedItemIndex]
    return this.props.fetcherCreater(selectedItem, params)
  }

  private handleItemSelect = (index: number) => {
    this.setState({ selectedItemIndex: index } as State)
  }

  private handleSelectFilter = (filter: HistoryFilter) => {
    this.setState({ selectedFilter: filter } as State)
  }

  private handleSearch = (term: string) => {
    this.setState({ searchTerm: term } as State)
  }
}

export default withTheme<Props>(HistoryPopup)
