import * as React from 'react'
import {Endpoint} from '../Playground'
import EndpointChooser from './QueryHeader/EndpointChooser'

interface Props {
  selectedEndpoint: Endpoint
  onChangeEndpoint: Function
  onPrettify: any
  showEndpoints?: boolean
  showQueryTitle?: boolean
}

const QueryHeader = ({selectedEndpoint, onChangeEndpoint, onPrettify, showEndpoints, showQueryTitle}: Props) => (
  <div className='query-header'>
    <style jsx={true}>{`
      .query-header {
        @inherit: .bgDarkerBlue, .pa25, .flex, .justifyBetween, .itemsCenter;
      }
      .graphiql-button {
        @inherit: .white50, .bgDarkBlue, .ttu, .f14, .fw6, .br2, .pointer;
        margin-right: 33px;
        padding: 5px 9px 6px 9px;
        letter-spacing: 0.53px;
      }
    `}</style>
    {showQueryTitle && (
      <div className="editor-title">
        Query
      </div>
    )}
    {showEndpoints && (
      <EndpointChooser
        selectedEndpoint={selectedEndpoint}
        onChangeEndpoint={onChangeEndpoint}
      />
    )}
    <div className="graphiql-button" onClick={onPrettify}>Prettify</div>
  </div>
)

export default QueryHeader