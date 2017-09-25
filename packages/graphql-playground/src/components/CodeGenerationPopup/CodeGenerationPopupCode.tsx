import * as React from 'react'
import * as cx from 'classnames'
import { $p } from 'graphcool-styles'
import { CodeGenerator } from './codeGeneration'
import { GraphQLClient, Environment } from '../../types'
import withTheme from '../Theme/withTheme'
// tslint:disable-next-line
const Codemirror: any = require('react-codemirror')

export interface Props {
  query: string
  endpointUrl: string
  client: GraphQLClient
  environment: Environment
}

interface Theme {
  theme: string
}

class CodeGenerationPopupCode extends React.Component<Props & Theme, {}> {
  componentWillMount() {
    require('codemirror/lib/codemirror.css')
    require('codemirror/theme/dracula.css')
    require('codemirror/theme/duotone-light.css')
    require('codemirror/mode/javascript/javascript')
    require('codemirror/mode/shell/shell')
  }
  render() {
    const { client, environment, endpointUrl, query, theme } = this.props

    const generator = new CodeGenerator(client, environment, endpointUrl)
    const projectSetup = generator.getSetup()
    const code = generator.getCode(query)
    const title = environment !== 'Cli' ? 'Code' : 'Command'
    const mode = environment !== 'Cli' ? 'javascript' : 'shell'

    const codeTheme = theme === 'light' ? 'duotone-light' : 'dracula'

    return (
      <div className={cx($p.pa38, $p.pt16, 'code-generation-popup')}>
        <style jsx={true}>{`
          h3 {
            @p: .fw3, .f25, .mv16;
          }
        `}</style>
        <style jsx={true} global={true}>{`
          .code-generation-popup .CodeMirror {
            @p: .pa6;
            height: auto;
          }
        `}</style>
        {environment !== 'Cli' &&
          <div>
            <h3>Project Setup</h3>
            <Codemirror
              key={projectSetup}
              value={projectSetup}
              options={{
                height: 'auto',
                mode: 'shell',
                viewportMargin: Infinity,
                theme: codeTheme,
              }}
            />
          </div>}
        <h3>
          {title}
        </h3>
        <Codemirror
          key={code}
          value={code}
          options={{
            height: 'auto',
            viewportMargin: Infinity,
            mode,
            theme: codeTheme,
          }}
        />
      </div>
    )
  }
}

export default withTheme<Props>(CodeGenerationPopupCode)
