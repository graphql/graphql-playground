import * as React from 'react'
import styled from 'styled-components'
import { $v } from 'graphcool-styles'
import TracingRow from './TracingRow'

export interface TracingFormat {
  version: 1
  startTime: string
  endTime: string
  duration: number
  execution: {
    resolvers: Array<{
      path: Array<string | number>
      parentType: string
      fieldName: string
      returnType: string
      startOffset: number
      duration: number
    }>
  }
}

export interface Props {
  tracing?: TracingFormat
  tracingSupported?: boolean
}

const TracingWrapper = styled.div`
  padding-top: 16px;
  padding-left: 25px;
  color: white;
  overflow: auto;
`

const ReRun = styled.div`
  font-size: 14px;
`
const NotSupported = styled.div`
  font-size: 14px;
  color: ${$v.red};
`

const TracingRows = styled.div`
  margin-left: 100px;
`

export default class ResponseTracing extends React.Component<Props, {}> {
  render() {
    const { tracing, tracingSupported } = this.props
    return (
      <TracingWrapper>
        {tracing ? (
          <TracingRows>
            {tracing.execution.resolvers.map(res => (
              <div key={res.path.join('.')}>
                <TracingRow
                  path={res.path}
                  startOffset={res.startOffset}
                  duration={res.duration}
                />
              </div>
            ))}
          </TracingRows>
        ) : tracingSupported ? (
          <NotSupported>
            This GraphQL server doesn’t support tracing. See the following page
            for instructions:<br />
            https://github.com/apollographql/apollo-tracing
          </NotSupported>
        ) : (
          <ReRun>Please re-run the query to show tracing results.</ReRun>
        )}
      </TracingWrapper>
    )
  }
}
