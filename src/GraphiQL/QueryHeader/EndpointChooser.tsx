import * as React from 'react'
import {Endpoint} from '../../types'
import * as cx from 'classnames'

interface Props {
  selectedEndpoint: Endpoint
  onChangeEndpoint: Function
}

const EndpointChooser = ({selectedEndpoint, onChangeEndpoint}: Props) => (
  <div className='root'>
    <style jsx={true}>{`
      .root {
        @inherit: .fw6, .flex, .itemsCenter;
        color: rgba(255,255,255,.25);
      }

      .chooser {
        @inherit: .ml16, .flex, .itemsCenter;
      }

      .endpoint {
        padding: 5px 12px 6px 12px;
        @inherit: .bgBlack50, .br2, .relative, .pointer, .ttu;
        &.active {
          padding: 7px 9px 8px 9px;
          background-color: rgb(185,191,196);
          color: rgb(15,32,46);
          margin: 0 -2px;
          z-index: 2;
        }
      }
    `}</style>

    <div>API</div>
    <div className='chooser'>
      <div
        className={cx('endpoint', {
          'active': selectedEndpoint === 'RELAY',
        })}
        onClick={() => onChangeEndpoint('RELAY')}
      >Relay</div>
      <div
        className={cx('endpoint', {
          'active': selectedEndpoint === 'SIMPLE',
        })}
        onClick={() => onChangeEndpoint('SIMPLE')}
      >Simple</div>
    </div>
  </div>
)

export default EndpointChooser
