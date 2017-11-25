import * as React from 'react'
import * as cx from 'classnames'

export interface Props {
  showResponseTitle?: boolean
}

const ResultHeader = ({ showResponseTitle }: Props) => (
  <div className={cx('result-header subscription')}>
    <style jsx={true}>{`
      .result-header {
        @inherit: .bgDarkBlue,
          .flex,
          .justifyBetween,
          .itemsCenter,
          .relative,
          .mr25,
          .pl16;
        padding-top: 13px;
        margin-left: 38px;
        height: 75px;
        &.subscription {
          &:after {
            content: '';
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            height: 25px;
            background: linear-gradient(
              to bottom,
              rgba(23, 42, 58, 1) 0%,
              rgba(23, 42, 58, 0) 100%
            );
            z-index: 4;
          }
        }
      }
      .inner {
        @inherit: .absolute;
      }
    `}</style>
    <div className="inner">
      <div>
        {showResponseTitle && <div className="editor-title">Response</div>}
      </div>
    </div>
  </div>
)

export default ResultHeader
