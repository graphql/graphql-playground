import 'react'

declare module 'react' {
  interface HTMLProps<T> {
    jsx?: boolean
    global?: boolean
  }
}

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}
