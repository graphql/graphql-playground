import 'react'

// Augmentation of React
declare module 'react' {
  interface HTMLProps<T> {
    jsx?: boolean
    global?: boolean
  }
}

interface Window {
  GraphQLPlayground: any
}
