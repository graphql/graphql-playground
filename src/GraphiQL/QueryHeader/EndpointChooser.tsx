import * as React from 'react'
import {Endpoint} from '../../types'
import * as cx from 'classnames'
import Info from './Info'

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

      a {
        @inherit: .mt6, .dib;
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
    <Info>
      {selectedEndpoint === 'SIMPLE' ? (
        <div>
          <div>
            The Simple API is our most simplistic GraphQL API. It is highly recommended in use with Apollo,
            as it is much simpler than the Relay API.
          </div>
          <a href='https://www.graph.cool/docs/reference/simple-api/overview-heshoov3ai'>Simple API Docs</a>
        </div>
      ) : (
        <div>
          <div>
            In order to use Relay, the backend must implement a spec that Relay needs.
            The Relay API fully supports this spec, so you can implement fully-fledged Relay Apps with Graphcool.
          </div>
          <a href='https://www.graph.cool/docs/reference/relay-api/overview-aizoong9ah'>Relay API Docs</a>
        </div>
      )}
    </Info>
  </div>
)

export default EndpointChooser
