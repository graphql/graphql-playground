import * as React from 'react'
import TypeLink from './TypeLink'

export interface DocTypeSchemaProps {
  type: any
  fields: any[]
  interfaces: any[]
  level: number
}

const DocTypeSchema = ({
  type,
  fields,
  interfaces,
  level,
}: DocTypeSchemaProps) => {
  const nonDeprecatedFields = fields.filter(data => !data.isDeprecated)
  const deprecatedFields = fields.filter(data => data.isDeprecated)
  return (
    <div className="doc-type-schema">
      <style jsx={true} global={true}>{`
        .doc-type-schema .doc-category-item {
          padding-left: 32px;
        }
        .doc-type-interface .field-name {
          color: rgb(245, 160, 0);
        }
        .doc-type-interface .type-name {
          color: #f25c54;
        }
      `}</style>
      <style jsx={true}>{`
        .doc-type-schema {
          @p: .pt20;
        }
        .doc-type-schema-line {
          @p: .ph16, .pv6;
        }
        .doc-value-comment {
          @p: .pr16, .black50;
          padding-left: 32px;
        }
        .doc-type-interface {
          @p: .pl16;
        }
        .type-line .type-name {
          color: #f25c54;
        }
      `}</style>
      <div className="doc-type-schema-line type-line">
        <span className="field-name">type</span>{' '}
        <span className="type-name">{type.name}</span>{' '}
        {interfaces.length === 0 &&
          <span className="type-name">
            {'{'}
          </span>}
      </div>
      {interfaces.map((data, index) =>
        <TypeLink
          key={data.name}
          type={data}
          x={level}
          y={index}
          className="doc-type-interface"
          beforeNode={<span className="field-name">implements</span>}
          // Only show curly bracket on last interface
          afterNode={
            index === interfaces.length - 1
              ? <span className="type-name">
                  {'{'}
                </span>
              : null
          }
        />,
      )}
      {nonDeprecatedFields.map((data, index) =>
        <TypeLink
          key={data.name}
          type={data}
          x={level}
          y={index + interfaces.length}
        />,
      )}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map((data, index) =>
        <div key={data.name}>
          <span className="doc-value-comment">
            # Deprecated: {data.deprecationReason}
          </span>
          <TypeLink
            type={data}
            x={level}
            y={index + nonDeprecatedFields.length + interfaces.length}
          />
        </div>,
      )}
      <div className="doc-type-schema-line type-line">
        <span className="type-name">
          {'}'}
        </span>
      </div>
    </div>
  )
}

export default DocTypeSchema
