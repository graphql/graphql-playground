import * as React from 'react'
import { styled } from '../../styled'
import { AddIcon } from '../Icons'
import Tab, { Props as TabProps } from './Tab'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import {
  getMultipleRows,
  getSessionsArray,
  getSelectedSessionIdFromRoot,
} from '../../state/sessions/selectors'
import { Session } from '../../state/sessions/reducers'
import { reorderTabs } from '../../state/sessions/actions'
import {
  SortableContainer,
  SortableElement,
  SortStart,
  SortEnd,
} from 'react-sortable-hoc'

export interface Props {
  onNewSession: any
  isApp?: boolean
}

export interface ReduxProps {
  multipleRows: boolean
  sessions: Session[]
  selectedSessionId: string
  reorderTabs: (src: number, dest: number) => void
}

interface State {
  sorting: boolean
}

const SortableTab = SortableElement<TabProps>(Tab)

class TabBar extends React.PureComponent<Props & ReduxProps, State> {
  state = { sorting: false }

  render() {
    const { sessions, isApp, selectedSessionId, onNewSession, multipleRows } = this.props
    const { sorting } = this.state
    return (
        <MultipleRows multiple_rows={multipleRows}>
      <SortableTabBar
        onSortStart={this.onSortStart}
        onSortEnd={this.onSortEnd}
        getHelperDimensions={this.getHelperDimensions}
        axis={multipleRows ? 'xy' : 'x'}
        lockAxis={multipleRows ? 'xy' : 'x'}
        lockToContainerEdges={true}
        distance={10}
        transitionDuration={200}
      >
        <Tabs isApp={isApp} multiple_rows={multipleRows}>
          {sessions.map((session, ndx) => (
            <SortableTab
              key={session.id}
              session={session}
              selectedSessionId={selectedSessionId}
              index={ndx}
            />
          ))}
          <Plus onClick={onNewSession} sorting={sorting}>
            <AddIcon
              width={34}
              height={34}
              strokeWidth={4}
              title="Opens a New Tab"
            />
          </Plus>
        </Tabs>
      </SortableTabBar>
        </MultipleRows>
    )
  }

  private onSortStart = ({ index }: SortStart) => {
    this.setState({ sorting: true })
  }

  private onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    this.props.reorderTabs(oldIndex, newIndex)
    this.setState({ sorting: false })
  }

  private getHelperDimensions = ({ node }: SortStart) => {
    const { width, height } = node.getBoundingClientRect()
    return { width, height }
  }
}

const mapStateToProps = createStructuredSelector({
  sessions: getSessionsArray,
  multipleRows: getMultipleRows,
  selectedSessionId: getSelectedSessionIdFromRoot,
})

export default connect(
  mapStateToProps,
  { reorderTabs },
)(TabBar)

const StyledTabBar = styled.div`
  color: white;
  height: 57px;
  background: ${p => p.theme.editorColours.background};
  overflow: hidden;
  -webkit-app-region: drag;
  &:hover {
    overflow-x: overlay;
  }
`

const SortableTabBar = SortableContainer(StyledTabBar)

interface TabsProps {
  isApp?: boolean
}

const MultipleRows = styled.div`
  & > div {
    height: ${(p) => (p.multiple_rows ? 'auto' : '57px')};
  }
`

const Tabs = styled<TabsProps, 'div'>('div')`
  display: flex;
  align-items: center;
  flex-wrap: ${(p) => (p.multiple_rows ? 'wrap' : 'nowrap')};
  margin-top: ${(p) => (p.multiple_rows ? '8px' : '16px')};
  padding-left: ${p => (p.isApp ? '43px' : '0')};

  & > div {
    margin-top: ${(p) => (p.multiple_rows ? '8px' : 0)};
  }
`

interface PlusProps {
  sorting: boolean
}

const Plus = styled<PlusProps, 'div'>('div')`
  -webkit-app-region: no-drag;
  box-sizing: border-box;
  display: flex;
  visibility: ${p => (p.sorting ? 'hidden' : 'visible')}
  height: 43px;
  width: 43px;
  border-radius: 2px;
  border-bottom: 2px solid ${p => p.theme.editorColours.navigationBar};
  background: ${p => p.theme.editorColours.tabInactive};
  justify-content: center;
  align-items: center;
  svg {
    stroke: ${p => p.theme.editorColours.icon};
  }
  &:hover {
    background: ${p => p.theme.editorColours.tab};
  }
`
