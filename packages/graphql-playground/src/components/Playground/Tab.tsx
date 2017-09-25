import * as React from 'react'
import { Session } from '../../types'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import { $v } from 'graphcool-styles'

interface Props {
  session: Session
  index: number
  onSelectSession: (session: Session) => void
  onCloseSession: (session: Session) => void
  selectedSessionIndex: number
  tether: any
  onboardingStep?: string
  theme?: string
}

export default class Tab extends React.PureComponent<Props, {}> {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {
      session,
      index,
      selectedSessionIndex,
      onboardingStep,
      theme,
      tether,
    } = this.props
    const { queryTypes } = session
    const Tether = tether

    return (
      <div
        key={session.id}
        className={`tab ${index === selectedSessionIndex && 'active'}`}
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
              .pointer;
            height: 43px;
            padding: 10px;
            padding-top: 9px;
            &.active {
              @p: .bgDarkBlue;
            }
          }
          .light .tab {
            background-color: #e7eaec;
            &.active {
              background-color: #eeeff0;
            }
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
            @p: .ml10, .o50, .relative;
            top: 1px;
            &.active {
              @p: .o100;
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
        `}</style>
        <div className={`icons ${index === selectedSessionIndex && 'active'}`}>
          {session.subscriptionActive && <div className="red-dot" />}
          <div className="query-types">
            {queryTypes.query && <div className="query-type query">Q</div>}
            {queryTypes.mutation &&
              <div className="query-type mutation">M</div>}
            {queryTypes.subscription &&
              <div className="query-type subscription">S</div>}
          </div>
          {session.selectedViewer !== 'ADMIN' &&
            <div className="viewer">
              {session.selectedViewer === 'EVERYONE' &&
                <Icon
                  src={require('graphcool-styles/icons/fill/world.svg')}
                  color={theme === 'dark' ? $v.white40 : $v.gray40}
                  width={14}
                  height={14}
                />}
              {session.selectedViewer === 'USER' &&
                <Icon
                  src={require('graphcool-styles/icons/fill/user.svg')}
                  color={theme === 'dark' ? $v.white40 : $v.gray40}
                  width={14}
                  height={14}
                />}
            </div>}
        </div>
        {tether && onboardingStep === 'STEP3_SELECT_QUERY_TAB' && index === 0
          ? <Tether
              steps={[
                {
                  step: 'STEP3_SELECT_QUERY_TAB',
                  title: 'Back to the query',
                  description:
                    "After creating the data with our mutations, let's see what we got",
                },
              ]}
            >
              <div
                className={`operation-name ${index === selectedSessionIndex &&
                  'active'}`}
              >
                {session.operationName ||
                  queryTypes.firstOperationName ||
                  'New Session'}
              </div>
            </Tether>
          : <div
              className={`operation-name ${index === selectedSessionIndex &&
                'active'}`}
            >
              {session.operationName ||
                queryTypes.firstOperationName ||
                'New Session'}
            </div>}
        <div
          className={`close ${index === selectedSessionIndex && 'active'}`}
          onClick={this.handleCloseSession}
        >
          <Icon
            src={require('graphcool-styles/icons/stroke/cross.svg')}
            stroke={true}
            color={theme === 'dark' ? $v.white40 : $v.darkBlue40}
            width={12}
            height={11}
            strokeWidth={7}
          />
        </div>
      </div>
    )
  }

  private handleSelectSession = () => {
    this.props.onSelectSession(this.props.session)
  }

  private handleCloseSession = (e: any) => {
    e.stopPropagation()
    this.props.onCloseSession(this.props.session)
  }
}
