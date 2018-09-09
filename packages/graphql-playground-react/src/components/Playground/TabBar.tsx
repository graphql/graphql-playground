import * as React from 'react'
import { styled } from '../../styled'
import { AddIcon } from './Icons'
import Tab from './Tab'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import {
  getSessionsArray,
  getSelectedSessionIdFromRoot,
} from '../../state/sessions/selectors'
import { Session } from '../../state/sessions/reducers'

export interface Props {
  onNewSession: any
  isApp?: boolean
}

export interface ReduxProps {
  sessions: Session[]
  selectedSessionId: string
}

const TabBar = ({
  sessions,
  isApp,
  selectedSessionId,
  onNewSession,
}: Props & ReduxProps) => (
  <StyledTabBar>
    <Tabs isApp={isApp}>
      {sessions.map(session => (
        <Tab
          key={session.id}
          session={session}
          selectedSessionId={selectedSessionId}
        />
      ))}
      <Plus onClick={onNewSession}>
        <AddIcon width={34} height={34} strokeWidth={4} />
      </Plus>
    </Tabs>
  </StyledTabBar>
)

const mapStateToProps = createStructuredSelector({
  sessions: getSessionsArray,
  selectedSessionId: getSelectedSessionIdFromRoot,
})

export default connect(mapStateToProps)(TabBar)

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

interface TabsProps {
  isApp?: boolean
}

const Tabs = styled<TabsProps, 'div'>('div')`
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding-left: ${p => (p.isApp ? '43px' : '0')};
`

const Plus = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 43px;
  width: 43px;
  margin-left: 10px;
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
