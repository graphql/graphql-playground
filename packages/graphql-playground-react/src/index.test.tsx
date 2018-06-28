import * as React from 'react'
import { render } from 'enzyme'
import MiddlewareApp from './components/MiddlewareApp'

test('test middleware app without tabs', () => {
  const wrapper = render(
    <MiddlewareApp setTitle={true} showNewWorkspace={false} />,
  )
  expect(wrapper).toMatchSnapshot()
})

test('test middleware app with tabs', () => {
  const wrapper = render(
    <MiddlewareApp
      setTitle={true}
      showNewWorkspace={false}
      tabs={[
        {
          name: 'Tab 1',
          query: '{ users { id } }',
          endpoint: 'https://eu1.prisma.sh/public-asdf/session65/dev',
          responses: ['{}'],
        },
        {
          name: 'Tab 2',
          query: '{ users { id } }',
          endpoint: 'https://eu1.prisma.sh/public-asdf/session65/dev',
        },
      ]}
    />,
  )
  expect(wrapper).toMatchSnapshot()
})
