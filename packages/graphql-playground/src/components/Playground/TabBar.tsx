import * as React from 'react'
import * as cx from 'classnames'
import { Session } from '../../types'
import { Icon } from 'graphcool-styles'
import { withTheme, OptionalLocalThemeInterface } from '../Theme'
import Tab from './Tab'

export interface Props extends OptionalLocalThemeInterface {
  sessions: Session[]
  selectedSessionIndex: number
  onNewSession: any
  onCloseSession: (session: Session) => void
  onOpenHistory: () => void
  onSelectSession: (session: Session) => void
  onboardingStep?: string
  tether?: any
  nextStep?: () => void
  isApp?: boolean
}

const white20 = '#4a555f'
const darkBlue20 = '#c2c8cb'

export const TabBar = withTheme<Props>(
  ({
    sessions,
    selectedSessionIndex,
    onNewSession,
    onSelectSession,
    onOpenHistory,
    onCloseSession,
    onboardingStep,
    tether,
    localTheme,
    isApp,
    nextStep,
  }: Props) => {
    const Tether = tether

    return (
      <div className={cx('tabbar', localTheme)}>
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
          .tabbar {
            @p: .white, .z4;
            height: 57px;
            background-color: $darkBlueGray;
            -webkit-app-region: drag;

            path {
              stroke: white;
            }
          }
          .tabbar.light {
            @p: .darkBlue50;
            background-color: #dbdee0;
          }

          .tabs {
            @p: .mt16, .ml0, .flex, .itemsCenter, .z0, .overflowAuto;
            margin-right: 240px;
          }

          .tabs.isApp {
            padding-left: 52px;
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
            top: -2px;
            position: relative;
          }
          .tab:hover {
            @p: .bgDarkBlue;
          }
          .light.tab:hover {
            background-color: #eeeff0;
          }
          .history:hover :global(.icon) :global(svg),
          .history.open :global(.icon) :global(svg) {
            stroke: $white60;
          }
          .history.light:hover :global(.icon) :global(svg),
          .history.light.open :global(.icon) :global(svg) {
            stroke: $darkBlue60;
          }
        `}</style>
        <div className={cx('tabs', { isApp })}>
          {sessions.map((session, index) => (
            <Tab
              key={session.id}
              session={session}
              index={index}
              onSelectSession={onSelectSession}
              selectedSessionIndex={selectedSessionIndex}
              onCloseSession={onCloseSession}
              tether={tether}
              localTheme={localTheme}
              onboardingStep={onboardingStep}
            />
          ))}
          {tether && onboardingStep === 'STEP3_CREATE_MUTATION_TAB' ? (
            <Tether
              offsetY={-7}
              steps={[
                {
                  step: 'STEP3_CREATE_MUTATION_TAB',
                  title: 'Apparently, there is no data yet',
                  description: 'Click here to create new data',
                },
              ]}
            >
              <div className="tab plus" onClick={onNewSession}>
                <Icon
                  src={require('graphcool-styles/icons/stroke/add.svg')}
                  color={localTheme === 'dark' ? white20 : darkBlue20}
                  width={34}
                  height={34}
                  stroke={true}
                  strokeWidth={4}
                />
              </div>
            </Tether>
          ) : (
            <div className="tab plus" onClick={onNewSession}>
              <Icon
                src={require('graphcool-styles/icons/stroke/add.svg')}
                color={localTheme === 'dark' ? white20 : darkBlue20}
                width={34}
                height={34}
                stroke={true}
                strokeWidth={4}
              />
            </div>
          )}
          <div className={cx('history', localTheme)}>
            <Icon
              className="icon"
              src={require('graphcool-styles/icons/stroke/history.svg')}
              stroke={true}
              strokeWidth={4}
              width={27}
              height={27}
              color={localTheme === 'dark' ? white20 : darkBlue20}
              onClick={onOpenHistory}
            />
          </div>
        </div>
        {localTheme === 'light' && <div className="border-bottom" />}
      </div>
    )
  },
)
