import * as React from 'react'
import { SettingsIcon, CrossIcon } from '../Icons'
import { connect } from 'react-redux'
import { closeTab, selectTab, editName } from '../../state/sessions/actions'
import { styled } from '../../styled'
import { Session } from '../../state/sessions/reducers'
import AutosizeInput from 'react-input-autosize'

export interface Props {
  session: Session
  selectedSessionId: string
}

export interface ReduxProps {
  selectTab: (sessionId: string) => void
  closeTab: (sessionId: string) => void
  editName: (name: string) => void
}

export interface State {
  overCross: boolean
  editingName: boolean
}

class Tab extends React.PureComponent<Props & ReduxProps, State> {
  constructor(props) {
    super(props)

    this.state = {
      overCross: false,
      editingName: false,
    }
  }

  render() {
    const { session, selectedSessionId } = this.props
    const { queryTypes } = session

    const active = session.id === selectedSessionId

    const name =
      session.name ||
      session.operationName ||
      queryTypes.firstOperationName ||
      'New Tab'

    return (
      <TabItem active={active} onMouseDown={this.handleSelectSession}>
        <Icons active={active}>
          {session.subscriptionActive && <RedDot />}
          <QueryTypes>
            {queryTypes.query && <Query>Q</Query>}
            {(session.isSettingsTab || session.isConfigTab) && (
              <Query>
                <SettingsIcon width={12} height={12} fill="white" />
              </Query>
            )}
            {queryTypes.mutation && <Mutation>M</Mutation>}
            {queryTypes.subscription && <Subscription>S</Subscription>}
          </QueryTypes>
        </Icons>
        {this.state.editingName ? (
          <OperationNameInput
            value={session.name || ''}
            onChange={this.handleEditName}
            onBlur={this.stopEditName}
            onKeyDown={this.handleKeyDown}
            autoFocus={true}
          />
        ) : (
          <OperationName active={active} onDoubleClick={this.startEditName}>
            {name}
          </OperationName>
        )}
        <Close
          className="close"
          active={active}
          hasCircle={session.isFile && session.changed && !this.state.overCross}
          onClick={this.handleCloseSession}
          onMouseEnter={this.handleMouseOverCross}
          onMouseLeave={this.handleMouseOutCross}
        >
          {session.isFile && session.changed && !this.state.overCross ? (
            <Circle>⬤</Circle>
          ) : (
            <CrossIcon
              width={12}
              height={11}
              strokeWidth={7}
              title="Close Tab"
            />
          )}
        </Close>
      </TabItem>
    )
  }

  private startEditName = () => {
    this.setState({ editingName: true })
  }

  private stopEditName = () => {
    this.setState({ editingName: false })
  }

  private handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.setState({ editingName: false })
    }
  }

  private handleMouseOverCross = () => {
    this.setState({ overCross: true })
  }

  private handleMouseOutCross = () => {
    this.setState({ overCross: false })
  }

  private handleSelectSession = () => {
    this.props.selectTab(this.props.session.id)
  }

  private handleCloseSession = (e: any) => {
    e.stopPropagation()
    this.props.closeTab(this.props.session.id)
  }

  private handleEditName = e => {
    this.props.editName(e.target.value)
  }
}

export default connect(
  null,
  { closeTab, selectTab, editName },
)(Tab)

interface TabItemProps {
  active: boolean
  hasCircle?: boolean
}

const TabItem = styled<TabItemProps, 'div'>('div')`
  -webkit-app-region: no-drag;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: 43px;
  padding: 10px;
  padding-top: 9px;
  margin-right: 10px;
  font-size: 14px;
  border-radius: 2px;
  border-bottom: 2px solid ${p => p.theme.editorColours.navigationBar};
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  background: ${p =>
    p.active ? p.theme.editorColours.tab : p.theme.editorColours.tabInactive};
  &:hover {
    background: ${p => p.theme.editorColours.tab};
    .close {
      opacity: 1;
    }
  }
`

const OperationName = styled<TabItemProps, 'div'>('div')`
  opacity: ${p => (p.active ? 1 : 0.5)};
  background: transparent;
  color: ${p => p.theme.editorColours.tabText};
  font-size: 14px;
  margin-left: 2px;
  display: inline;
  letter-spacing: 0.53px;
`

const OperationNameInput = styled(AutosizeInput)`
  input {
    background: transparent;
    color: ${p => p.theme.editorColours.tabText};
    font-size: 14px;
    margin-left: 2px;
    display: inline;
    letter-spacing: 0.53px;
  }
`

const Icons = styled<TabItemProps, 'div'>('div')`
  display: flex;
  align-items: center;
  opacity: ${p => (p.active ? 1 : 0.5)};
`

const QueryTypes = styled.div`
  display: flex;
  color: white;
`

const QueryType = styled.div`
  height: 22px;
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 2px;
`

const Query = styled(QueryType)`
  background: ${p => p.theme.colours.blue};
`

const Mutation = styled(QueryType)`
  background: ${p => p.theme.colours.orange};
`

const Subscription = styled(QueryType)`
  background: ${p => p.theme.colours.purple};
`

const RedDot = styled.div`
  width: 7px;
  height: 7px;
  background: rgba(242, 92, 84, 1);
  border-radius: 100%;
  margin-right: 10px;
`

const Circle = styled.div`
  position: relative;
  top: -2px;
  font-size: 9px;
  background: ${p => p.theme.editorColours.circle};
`

const Close = styled<TabItemProps, 'div'>('div')`
  position: relative;
  display: flex;
  margin-left: 10px;
  top: 1px;
  height: 13px;
  width: 13px;
  opacity: ${p => (p.active || p.hasCircle ? 1 : 0)};
  svg {
    stroke: ${p => p.theme.editorColours.icon};
  }
`
