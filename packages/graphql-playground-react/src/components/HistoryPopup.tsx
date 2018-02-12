import * as React from 'react'
import * as Modal from 'react-modal'
import HistoryHeader from './HistoryPopup/HistoryHeader'
import { HistoryFilter, Session, ApolloLinkExecuteResponse } from '../types'
import HistoryItems from './HistoryPopup/HistoryItems'
import { Icon } from 'graphcool-styles'
import { modalStyle } from '../constants'
import { withTheme, LocalThemeInterface } from './Theme'
import * as cn from 'classnames'
import { SchemaFetcher } from './Playground/SchemaFetcher'
import { QueryEditor } from './Playground/QueryEditor'
import { styled } from '../styled'
import * as theme from 'styled-theming'
import { GraphQLRequest } from 'apollo-link'

export interface Props {
  isOpen: boolean
  onRequestClose: () => void
  historyItems: Session[]
  onItemStarToggled: (item: Session) => void
  fetcherCreater: (
    item: Session,
    params: GraphQLRequest,
  ) => ApolloLinkExecuteResponse
  onCreateSession: (session: Session) => void
  schemaFetcher: SchemaFetcher
}

export interface State {
  selectedFilter: HistoryFilter
  selectedItemIndex: number
  searchTerm: string
}

class HistoryPopup extends React.Component<Props & LocalThemeInterface, State> {
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
    const { localTheme } = this.props
    const items = this.props.historyItems.filter(item => {
      return selectedFilter === 'STARRED'
        ? item.starred
        : true &&
            (searchTerm && searchTerm.length > 0
              ? item.query.toLowerCase().includes(searchTerm.toLowerCase())
              : true)
    })

    const selectedItem = items[this.state.selectedItemIndex]
    let customModalStyle = modalStyle
    if (localTheme === 'light') {
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
        <Wrapper className={localTheme}>
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
              onItemStarToggled={this.props.onItemStarToggled}
            />
          </Left>
          {Boolean(selectedItem) ? (
            <Right>
              <RightHeader>
                <View />
                <Use onClick={this.handleClickUse}>
                  <UseText>Use</UseText>
                  <Icon
                    src={require('../assets/icons/arrowRight.svg')}
                    color="white"
                    stroke={true}
                    width={13}
                    height={13}
                  />
                </Use>
              </RightHeader>
              <Big
                className={cn({
                  'docs-graphiql': localTheme === 'light',
                })}
              >
                <GraphiqlWrapper
                  className={cn({
                    'graphiql-wrapper': localTheme === 'light',
                  })}
                >
                  <div className="graphiql-container">
                    <div className="queryWrap">
                      <QueryEditor value={selectedItem.query} />
                    </div>
                  </div>
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

/*
.left {
  @p: .flex1, .bgWhite;
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
*/

const Wrapper = styled.div`
  display: flex;
  min-height: 500px;

  & .graphiql-container.graphiql-container {
    height: calc(100% - 81px) !important;

    & .queryWrap.queryWrap {
      border-top: none;
    }
  }
`

const Left = styled.div`
  flex: 1;

  background: white;
`

const Right = styled.div`
  flex: 0 0 464px;
  z-index: 2;
`

const rightBackgroundColor = theme('mode', {
  light: '#f6f7f7',
  dark: p => p.theme.colours.darkBlue,
})

const RightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-left: ${p => p.theme.sizes.medium25};
  padding-right: ${p => p.theme.sizes.medium25};
  padding-top: 20px;
  padding-bottom: 20px;

  background: ${rightBackgroundColor};
`

const RightEmpty = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  background: ${rightBackgroundColor};
`

const color = theme('mode', {
  dark: p => p.theme.colours.white60,
  light: p => p.theme.colours.darkBlue60,
})

const RightEmptyText = styled.div`
  font-size: 16px;
  color: ${color};
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
  height: 100%;
  display: flex;
  flex: 1 1 auto;
`

const GraphiqlWrapper = Big.extend`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex: 1 1 auto;
`
