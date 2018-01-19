import * as React from 'react'
import ageOfDate from './util/ageOfDate'
import { ResultViewer } from './ResultViewer'
import { Response } from '../Playground'
import * as cn from 'classnames'

export interface Props {
  disableResize?: boolean
  setRef: (ref: any) => void
  hideGutters?: boolean
  responses: Response[]
}

export default class Results extends React.Component<Props, {}> {
  render() {
    const { disableResize } = this.props
    const isSubscription = this.props.responses.length > 1
    return (
      <div
        className={cn('result-window', {
          disableResize,
          isSubscription,
        })}
        ref={this.props.setRef}
      >
        <style jsx={true}>{`
          .result-window {
            @p: .bgDarkBlue, .nosb, .relative;
          }

          .result-window.disableResize :global(.CodeMirror-gutters) {
            cursor: default !important;
          }

          .subscription-time {
            @p: .relative;
            height: 17px;
            margin-top: 12px;
            margin-bottom: 4px;
            &:before {
              @p: .absolute, .w100;
              content: '';
              top: 9px;
              left: 95px;
              border-top: 1px solid $white20;
            }
          }

          .subscription-time-text {
            @p: .bgDarkBlue, .white50, .f12;
            padding-left: 15px;
          }

          .result-viewer-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;
          }
          .isSubscription .result-viewer-wrapper {
            position: relative;
          }
        `}</style>
        {this.props.responses.map(response => (
          <div key={response.resultID || String(response.time)}>
            {this.props.responses.length > 1 &&
              response.time && (
                <div className="subscription-time">
                  <div className="subscription-time-text">
                    {ageOfDate(response.time)}
                  </div>
                </div>
              )}
            <div className="result-viewer-wrapper">
              <ResultViewer
                value={response.date}
                hideGutters={this.props.hideGutters}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
}
