import * as React from 'react'
import { Session } from '../../types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'

export interface Props {
  session: Session
  index: number
  onSelectSession: (session: Session) => void
  onCloseSession: (session: Session) => void
  selectedSessionIndex: number
  localTheme?: string
}

export interface State {
  overCross: boolean
}

export default class Tab extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      overCross: false,
    }
  }

  render() {
    const { session, index, selectedSessionIndex, localTheme } = this.props
    const { queryTypes } = session

    return (
      <div
        className={`tab ${index === selectedSessionIndex && 'active'} ${
          localTheme
        }`}
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

          .operation-name {
            @p: .o50;
            &.active {
              @p: .o100;
            }
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
        <div className={`icons ${index === selectedSessionIndex && 'active'}`}>
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
        <div
          className={`operation-name ${index === selectedSessionIndex &&
            'active'}`}
        >
          {session.name ||
            session.operationName ||
            queryTypes.firstOperationName ||
            'New Tab'}
        </div>
        <div
          className={`close${index === selectedSessionIndex ? ' active' : ''}${
            session.isFile && session.hasChanged && !this.state.overCross
              ? ' hasCircle'
              : ''
          }`}
          onClick={this.handleCloseSession}
          onMouseEnter={this.handleMouseOverCross}
          onMouseLeave={this.handleMouseOutCross}
        >
          {session.isFile && session.hasChanged && !this.state.overCross ? (
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

  private handleMouseOverCross = () => {
    this.setState({ overCross: true })
  }

  private handleMouseOutCross = () => {
    this.setState({ overCross: false })
  }

  private handleSelectSession = () => {
    this.props.onSelectSession(this.props.session)
  }

  private handleCloseSession = (e: any) => {
    e.stopPropagation()
    this.props.onCloseSession(this.props.session)
  }
}
