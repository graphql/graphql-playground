import * as React from 'react'
import MarkdownContent from 'graphiql/dist/components/DocExplorer/MarkdownContent'
import SDLDocType from './SDLDocType'
import ScalarTypeSchema from '../../DocExplorer/DocsTypes/ScalarType'
import EnumTypeSchema from '../../DocExplorer/DocsTypes/EnumTypeSchema'
import SDLUnionType from './SDLUnionType'
import { CategoryTitle } from '../../DocExplorer/DocsStyles'
import { styled } from '../../../../styled'

export interface Props {
  schema: any
  type: any
}

export interface State {
  showDeprecated: boolean
}

export default class FieldDoc extends React.Component<Props, State> {
  state = { showDeprecated: false }

  render() {
    const { type, schema } = this.props
    return (
      <div>
        <CategoryTitle>{`${type.name} details`}</CategoryTitle>
        {type.description &&
          type.description.length > 0 && (
            <DocsDescription markdown={type.description || ''} />
          )}
        {type.instanceOf === 'scalar' && <ScalarTypeSchema type={type} />}
        {type.instanceOf === 'enum' && (
          <EnumTypeSchema sdlType={true} type={type} />
        )}
        {type.instanceOf === 'union' && (
          <SDLUnionType type={type} schema={schema} />
        )}
        {type.fields.length > 0 && (
          <SDLDocType
            type={type}
            fields={type.fields}
            interfaces={type.interfaces}
          />
        )}
      </div>
    )
  }
}

const DocsDescription = styled(MarkdownContent)`
  font-size: 14px;
  padding: 0 16px 20px 16px;
  color: rgba(0, 0, 0, 0.5);
`
