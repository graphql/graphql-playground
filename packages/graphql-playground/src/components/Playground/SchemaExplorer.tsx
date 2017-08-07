import * as React from 'react'
import { QueryEditor } from './QueryEditor'

export interface Props {
  idl?: string
  ref?: any
  modelName?: string
}

export default function SchemaExplorer({ idl, modelName }: Props) {
  return (
    <div className="schema-explorer">
      <style jsx={true}>{`
        .schema-explorer {
          @p: .h100, .flex, .flexColumn, .bgDarkerBlue;
        }
        .header {
          @p: .flexFixed, .f16, .fw6, .pt16, .pl16, .pr16, .white40, .ttu;
          letter-spacing: 0.6px;
        }
        .schema-explorer :global(.CodeMirror-cursor) {
          @p: .dn;
        }
      `}</style>
      <div className="header">
        Schema for „{modelName}“
      </div>
      <QueryEditor
        schema={null}
        value={idl || ''}
        readOnly={true}
        hideLineNumbers={true}
      />
    </div>
  )
}
