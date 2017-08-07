import * as React from 'react'

const Info = props =>
  <div className="info">
    <style jsx={true}>{`
      .question-mark {
        @inherit: .bgWhite10, .flex, .itemsCenter, .justifyCenter, .white40,
          .f12, .fw6, .br100, .pointer;
        width: 18px;
        height: 18px;
      }
      .tooltip {
        @inherit: .dn, .absolute;
        z-index: 20;
        width: 250px;
        padding-top: 5px;
        left: -50px;
      }
      .tooltip-content {
        @inherit: .br2, .bgWhite, .pa16, .black50, .f14, .fw4, .relative;
        &:before {
          @inherit: .absolute, .bgWhite;
          content: "";
          top: -4px;
          left: 55px;
          transform: rotate(45deg);
          width: 8px;
          height: 8px;
        }
      }
      .info {
        @inherit: .ml10, .relative;
        &:hover .tooltip {
          @inherit: .db;
        }
        &:hover .question-mark {
          @inherit: .bgBlue, .white;
        }
      }
    `}</style>
    <div className="question-mark">?</div>
    <div className="tooltip">
      <div className="tooltip-content">
        {props.children}
      </div>
    </div>
  </div>

export default Info
