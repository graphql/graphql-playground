import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import { connect } from 'react-redux'
import { closeTab, selectTab, editName } from '../../state/sessions/actions'
import * as cn from 'classnames'
import { styled, withProps } from '../../styled'
import { Session } from '../../state/sessions/reducers'
import AutosizeInput from 'react-input-autosize'

export interface Props {
  session: Session
  localTheme?: string
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
    const { session, selectedSessionId, localTheme } = this.props
    const { queryTypes } = session

    const active = session.id === selectedSessionId

    const name =
      session.name ||
      session.operationName ||
      queryTypes.firstOperationName ||
      'New Tab'

    return (
      <TabItem onClick={this.handleSelectSession}>
        <style jsx={true}>{`
          .tab:hover :global(.close) {
            opacity: 1;
          }
          .light.tab:hover {
            background-color: #eeeff0;
          }

          .tab .operation-name,
          .tab :global(input) {
            @p: .o50;
            background: transparent !important;
            color: white;
            font-size: 14px;
            margin-left: 2px;
            display: inline;
            letter-spacing: 0.53px;
            &.active {
              @p: .o100;
            }
          }

          .light.tab .operation-name,
          .light.tab :global(input) {
            color: $darkBlue80;
          }

          .tab :global(input) {
            opacity: 1 !important;
          }

          .close {
            @p: .ml10, .relative;
            top: 1px;
            height: 13px;
            width: 13px;
            opacity: 0;

            &.active {
              @p: .o100;
              opacity: 1;
            }

            &.hasCircle {
              opacity: 1;
            }
          }
          .circle {
            @p: .white40, .relative;
            font-size: 9px;
            top: -2px;
          }

          .light .circle {
            @p: .darkBlue40;
          }
        `}</style>
        <Icons active={active}>
          {session.subscriptionActive && <RedDot />}
          <QueryTypes>
            {queryTypes.query && <Query>Q</Query>}
            {(session.isSettingsTab || session.isConfigTab) && (
              <Query>
                <Icon
                  src={require('graphcool-styles/icons/fill/settings.svg')}
                  width={12}
                  height={12}
                  color="white"
                />
              </Query>
            )}
            {queryTypes.mutation && <Mutation>M</Mutation>}
            {queryTypes.subscription && <Subscription>S</Subscription>}
          </QueryTypes>
        </Icons>
        {this.state.editingName ? (
          <AutosizeInput
            value={session.name}
            onChange={this.handleEditName}
            onBlur={this.stopEditName}
            onKeyDown={this.handleKeyDown}
            autoFocus={true}
            className="operation-name"
            style={{ background: 'transparent' }}
          />
        ) : (
          <div
            className={cn('operation-name', { active })}
            onDoubleClick={this.startEditName}
          >
            {name}
          </div>
        )}
        <div
          className={cn('close', {
            active,
            hasCircle:
              session.isFile && session.changed && !this.state.overCross,
          })}
          onClick={this.handleCloseSession}
          onMouseEnter={this.handleMouseOverCross}
          onMouseLeave={this.handleMouseOutCross}
        >
          {session.isFile && session.changed && !this.state.overCross ? (
            <div className="circle">⬤</div>
          ) : (
            <Icon
              src={require('graphcool-styles/icons/stroke/cross.svg')}
              stroke={true}
              color={localTheme === 'dark' ? 'rgb(74, 85, 95)' : $v.darkBlue40}
              width={12}
              height={11}
              strokeWidth={7}
            />
          )}
        </div>
        <A active={true} />
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
}

const A = withProps<TabItemProps>()(styled.div)``

const TabItem = styled.div`
  display: flex;
  align-items: center;
  height: 43px;
  padding: 10px;
  padding-top: 9px;
  margin-left: 10px;
  font-size: 14px;
  border-radius: 2px;
  box-sizing: border-box;
  cursor: pointer;
  background: ${p => p.theme.editorColours.tab};
  &:first-child {
    margin-left: 0;
  }
`

const Icons = withProps<TabItemProps>()(styled.div)`
  display: flex;
  align-items: center;
  opacity: ${p => (p.active ? 1 : 0.5)};
`

const QueryTypes = styled.div`
  display: flex;
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
  background: rgba(42, 126, 210, 1);
`

const Mutation = styled(QueryType)`
  background: rgba(241, 143, 1, 1);
`

const Subscription = styled(QueryType)`
  background: rgba(164, 3, 111, 1);
`

const RedDot = styled.div`
  width: 7px;
  height: 7px;
  background: rgba(242, 92, 84, 1);
  border-radius: 100%;
  margin-right: 10px;
`
