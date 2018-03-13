import * as React from 'react'
import ageOfDate from './util/ageOfDate'
import { ResultViewer } from './ResultViewer'
import { Response } from '../Playground'
import * as cn from 'classnames'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { getResponses } from '../../state/sessions/selectors'
import { toJS } from './util/toJS'

export interface Props {
  setRef: (ref: any) => void
}

export interface ReduxProps {
  responses: Response[]
}

const Results: React.SFC<Props & ReduxProps> = ({ setRef, responses }) => (
  <div
    className={cn('result-window', {
      isSubscription: responses.length > 1,
    })}
    ref={setRef}
  >
    <style jsx={true}>{`
      .result-window {
        @p: .bgDarkBlue, .nosb, .relative;
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
    {responses.map(response => (
      <div key={response.resultID || String(response.time)}>
        {responses.length > 1 &&
          response.time && (
            <div className="subscription-time">
              <div className="subscription-time-text">
                {ageOfDate(response.time)}
              </div>
            </div>
          )}
        <div className="result-viewer-wrapper">
          <ResultViewer value={response.date} />
        </div>
      </div>
    ))}
  </div>
)

const mapStateToProps = createStructuredSelector({
  responses: getResponses,
})

export default connect(mapStateToProps)(toJS(Results))
