import * as React from 'react'
import * as cx from 'classnames'
import { $p } from 'graphcool-styles'
import { CodeGenerator } from './codeGeneration'
import { GraphQLClient, Environment } from '../../types'
// tslint:disable-next-line
const Codemirror: any = require('react-codemirror')

export interface Props {
  query: string
  endpointUrl: string
  client: GraphQLClient
  environment: Environment
}

export default class CodeGenerationPopupCode extends React.Component<
  Props,
  {}
> {
  componentWillMount() {
    require('codemirror/lib/codemirror.css')
    require('codemirror/theme/dracula.css')
    require('codemirror/mode/javascript/javascript')
    require('codemirror/mode/shell/shell')
  }
  render() {
    const { client, environment, endpointUrl, query } = this.props

    const generator = new CodeGenerator(client, environment, endpointUrl)
    const projectSetup = generator.getSetup()
    const code = generator.getCode(query)

    return (
      <div className={cx($p.pa38, $p.pt16, 'code-generation-popup')}>
        <style jsx={true}>{`
          h3 {
            @inherit: .fw3, .f25, .mv16;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .code-generation-popup .CodeMirror {
            @inherit: .pa6;
            height: auto;
          }
        `}</style>
        <h3>Project Setup</h3>
        <Codemirror
          key={projectSetup}
          value={projectSetup}
          options={{
            height: 'auto',
            mode: 'shell',
            viewportMargin: Infinity,
            theme: 'dracula',
          }}
          onFocusChange={focused => {
            if (focused) {
              // TODO track
            }
          }}
        />
        <h3>Code</h3>
        <Codemirror
          key={code}
          value={code}
          options={{
            height: 'auto',
            viewportMargin: Infinity,
            mode: 'javascript',
            theme: 'dracula',
          }}
          onFocusChange={focused => {
            if (focused) {
              // TODO track
            }
          }}
        />
      </div>
    )
  }
}
