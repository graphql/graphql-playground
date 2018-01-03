import * as React from 'react'
import TypeLink from './TypeLink'

export interface DocTypeSchemaProps {
  type: any
  fields: any[]
  interfaces: any[]
  level: number
  sessionId: string
}

const DocTypeSchema = ({
  type,
  fields,
  interfaces,
  level,
  sessionId,
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
          @p: .overflowAuto, .f14;
        }
        .doc-type-schema-line {
          @p: .ph16, .pv6;
          white-space: nowrap;
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
        .brace {
          @p: .darkBlue50, .fw6;
        }
      `}</style>
      <div className="doc-type-schema-line type-line">
        <span className="field-name">type</span>{' '}
        <span className="type-name">{type.name}</span>{' '}
        {interfaces.length === 0 && <span className="brace">{`{`}</span>}
      </div>
      {interfaces.map((data, index) => (
        <TypeLink
          key={data.name}
          type={data}
          x={level}
          y={index}
          collapsable={true}
          className="doc-type-interface"
          beforeNode={<span className="field-name">implements</span>}
          afterNode={
            index === interfaces.length - 1 ? (
              <span className="brace">{'{'}</span>
            ) : null
          }
          sessionId={sessionId}
          lastActive={false}
        />
      ))}
      {nonDeprecatedFields.map((data, index) => (
        <TypeLink
          key={data.name}
          type={data}
          x={level}
          y={index + interfaces.length}
          collapsable={true}
          sessionId={sessionId}
          lastActive={false}
        />
      ))}
      {deprecatedFields.length > 0 && <br />}
      {deprecatedFields.map((data, index) => (
        <div key={data.name}>
          <span className="doc-value-comment">
            # Deprecated: {data.deprecationReason}
          </span>
          <TypeLink
            type={data}
            x={level}
            y={index + nonDeprecatedFields.length + interfaces.length}
            collapsable={true}
            sessionId={sessionId}
            lastActive={false}
          />
        </div>
      ))}
      <div className="doc-type-schema-line type-line">
        <span className="brace">{'}'}</span>
      </div>
    </div>
  )
}

export default DocTypeSchema
