import * as React from 'react'
import { $v } from 'graphcool-styles'
import TracingRow from './TracingRow'
import * as theme from 'styled-theming'
import styled from '../../styled/styled'
import { createStructuredSelector } from 'reselect'
import {
  getTracing,
  getCurrentQueryStartTime,
  getCurrentQueryEndTime,
  getTracingSupported,
  getQueryRunning,
} from '../../state/sessions/selectors'
import { connect } from 'react-redux'

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

export interface ReduxProps {
  tracing?: TracingFormat
  tracingSupported?: boolean
  startTime?: Date
  endTime?: Date
  queryRunning: boolean
}

const textColor = theme('mode', {
  light: p => p.theme.colours.darkBlue60,
  dark: p => p.theme.colours.white,
})

const TracingWrapper = styled.div`
  padding-top: 16px;
  padding-left: 25px;
  padding-right: 25px;
  color: ${textColor};
  overflow: auto;
  position: relative;
  height: 100%;
`

const ReRun = styled.div`
  font-size: 14px;
`
const NotSupported = styled.div`
  font-size: 14px;
  color: ${$v.lightOrange};
`

const TracingRows = styled.div`
  padding-left: 100px;
  padding-bottom: 100px;
  padding-top: 16px;
  position: absolute;
  overflow: auto;
  top: 0;
  left: 0;
  width: calc(100% + 100px);
  height: calc(100% + 116px);
`

interface Props {
  open: boolean
}

class ResponseTracing extends React.PureComponent<ReduxProps & Props> {
  render() {
    const { tracing, tracingSupported, startTime, endTime, open } = this.props
    const requestMs =
      tracing && startTime
        ? Math.abs(new Date(tracing.startTime).getTime() - startTime.getTime())
        : 0
    const responseMs =
      tracing && endTime
        ? Math.abs(endTime.getTime() - new Date(tracing.endTime).getTime())
        : 0
    const requestDuration = 1000 * 1000 * requestMs

    return (
      <TracingWrapper>
        {tracing && open ? (
          <TracingRows>
            <TracingRow
              path={['Request']}
              startOffset={0}
              duration={requestDuration}
            />
            {tracing.execution.resolvers.map(res => (
              <TracingRow
                key={res.path.join('.')}
                path={res.path}
                startOffset={res.startOffset + requestDuration}
                duration={res.duration}
              />
            ))}
            <TracingRow
              path={['Response']}
              startOffset={tracing.duration + requestDuration}
              duration={1000 * 1000 * responseMs}
            />
          </TracingRows>
        ) : tracingSupported ? (
          <ReRun>
            {this.props.queryRunning
              ? 'Running query ...'
              : 'Please re-run the query to show tracing results.'}
          </ReRun>
        ) : (
          <NotSupported>
            This GraphQL server doesn’t support tracing. See the following page
            for instructions:<br />
            https://github.com/apollographql/apollo-tracing
          </NotSupported>
        )}
      </TracingWrapper>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  tracing: getTracing,
  startTime: getCurrentQueryStartTime,
  endTime: getCurrentQueryEndTime,
  tracingSupported: getTracingSupported,
  queryRunning: getQueryRunning,
})

export default connect(mapStateToProps)(ResponseTracing)
