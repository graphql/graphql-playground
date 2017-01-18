import * as React from 'react'
import {Session} from '../Playground'

interface Props {
  sessions: Session[]
  selectedSessionIndex: number
}

export const TabBar = ({sessions, selectedSessionIndex}: Props) => (
  <div className='root'>
    <style jsx={true}>{`
      .root {
        @inherit: .bgDarkerBlue, .white;
        height: 60px;
      }
    `}</style>
    Tab Bar Nigga
  </div>
)