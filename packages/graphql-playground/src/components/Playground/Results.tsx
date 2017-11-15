import * as React from 'react'
import ageOfDate from './util/ageOfDate'
import { ResultViewer } from './ResultViewer'
import { Response } from '../Playground'
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer,
} from 'react-virtualized'

export interface Props {
  disableResize?: boolean
  setRef: (ref: any) => void
  hideGutters?: boolean
  responses: Response[]
}

const cache = new CellMeasurerCache({
  defaultWidth: window.innerWidth,
  fixedWidth: true,
  minHeight: 50,
})

export default class Results extends React.Component<Props, {}> {
  render() {
    return (
      <div
        className={
          'result-window' + (this.props.disableResize ? ' disableResize' : '')
        }
        ref={this.props.setRef}
      >
        <style jsx={true}>{`
          .result-window {
            @p: .bgDarkBlue, .nosb, .pt38;
          }

          .result-window.disableResize :global(.CodeMirror-gutters) {
            cursor: default !important;
          }
        `}</style>
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={this.props.responses.length}
              rowRenderer={this.rowRenderer}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
            />
          )}
        </AutoSizer>
      </div>
    )
  }

  private rowRenderer = ({ index, parent, key }) => {
    const response = this.props.responses[index]

    return (
      <CellMeasurer
        cache={cache}
        rowIndex={index}
        columnIndex={0}
        parent={parent}
        key={key}
      >
        <div key={response.resultID}>
          <style jsx={true}>{`
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
          `}</style>
          {this.props.responses.length > 1 &&
            response.time && (
              <div className="subscription-time">
                <div className="subscription-time-text">
                  {ageOfDate(response.time)}
                </div>
              </div>
            )}
          <ResultViewer
            value={response.date}
            hideGutters={this.props.hideGutters}
          />
        </div>
      </CellMeasurer>
    )
  }
}
