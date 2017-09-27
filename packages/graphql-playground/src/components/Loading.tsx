import * as React from 'react'

export default function Loading() {
  return (
    <div className="loading">
      <style>{`
        .loading {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text {
          font-size: 32px;
          font-weight: 200;
          color: rgba(255,255,255,.6);
          margin-left: 20px;
        }
        img {
          width: 78px;
          height: 78px;
        }
          .title {
          font-weight: 400;
        }
      `}</style>
      <img src="/logo.png" alt="" />
      <div className="text">
        Loading <span className="title">GraphQL Playground</span>
      </div>
    </div>
  )
}
