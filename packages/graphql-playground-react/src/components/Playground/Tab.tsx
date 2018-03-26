import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'
import { connect } from 'react-redux'
import { closeTab, selectTab } from '../../state/sessions/actions'
import * as cn from 'classnames'
import { Session } from '../../state/sessions/reducers'
import { editName } from '../../lib'
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
      <div
        className={cn('tab', localTheme, { active })}
        onClick={this.handleSelectSession}
      >
        <style jsx={true}>{`
          .tab {
            @p: .flex,
              .itemsCenter,
              .bgDarkerBlue,
              .br2,
              .brTop,
              .ml10,
              .bbox,
              .pointer,
              .nowrap;
            height: 43px;
            padding: 10px;
            padding-top: 9px;
            &.active {
              @p: .bgDarkBlue;
            }
            border-bottom: 2px solid #172a3a;
            font-size: 14px;
          }
          .tab:first-of-type {
            margin-left: 0;
          }
          .light.tab {
            background-color: #e7eaec;
            &.active {
              background-color: #eeeff0;
            }
            border-bottom: 2px solid #eeeff0;
          }
          .tab:hover {
            @p: .bgDarkBlue;
          }
          .tab:hover :global(.close) {
            opacity: 1;
          }
          .light.tab:hover {
            background-color: #eeeff0;
          }

          .icons {
            @p: .flex, .itemsCenter, .o50;
            &.active {
              @p: .o100;
            }
          }

          .red-dot {
            @p: .br100, .bgrRed, .mr10;
            width: 7px;
            height: 7px;
          }

          .query-type {
            @p: .br2, .flex, .itemsCenter, .justifyCenter, .mr4, .fw7, .f12;
            height: 21px;
            width: 21px;
            margin-right: 2px;
          }

          .light .query-type {
            @p: .white;
          }

          .subscription {
            @p: .bgPurple;
          }

          .query {
            @p: .bgBlue;
          }

          .mutation {
            @p: .bgLightOrange;
          }

          .viewer {
            @p: .mr10;
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

          .plus {
            @p: .flex, .justifyCenter, .itemsCenter;
            width: 43px;
          }

          .history {
            @p: .pointer, .absolute;
            top: 15px;
            right: 56px;
          }

          .change-theme {
            @p: .absolute, .pointer;
            top: 200px;
            right: 200px;
          }
          .border-bottom {
            height: 8px;
            background-color: #eeeff0;
            width: 100%;
          }

          .circle {
            @p: .white40, .relative;
            font-size: 9px;
            top: -2px;
          }

          .light .circle {
            @p: .darkBlue40;
          }
          .query-types {
            @p: .flex;
          }
        `}</style>
        <div className={cn('icons', { active })}>
          {session.subscriptionActive && <div className="red-dot" />}
          <div className="query-types">
            {queryTypes.query && <div className="query-type query">Q</div>}
            {(session.isSettingsTab || session.isConfigTab) && (
              <div className="query-type query">
                <Icon
                  src={require('graphcool-styles/icons/fill/settings.svg')}
                  width={12}
                  height={12}
                  color="white"
                />
              </div>
            )}
            {queryTypes.mutation && (
              <div className="query-type mutation">M</div>
            )}
            {queryTypes.subscription && (
              <div className="query-type subscription">S</div>
            )}
          </div>
        </div>
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
      </div>
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

export default connect(null, { closeTab, selectTab, editName })(Tab)
