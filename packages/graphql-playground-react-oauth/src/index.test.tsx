import * as React from 'react'
import { render, mount } from 'enzyme'
import MiddlewareApp from './components/MiddlewareApp'

test('test MiddleWareApp without tabs', () => {
  const wrapper = render(
    <MiddlewareApp setTitle={true} showNewWorkspace={false} />,
  )
  expect(wrapper).toMatchSnapshot()
})

test('test MiddleWareApp with tabs', () => {
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

test('test MiddleWareApp with one tab and click execute', () => {
  const wrapper = mount(
    <MiddlewareApp
      setTitle={true}
      showNewWorkspace={false}
      tabs={[
        {
          name: 'Tab 1',
          query: '{ users { id } }',
          endpoint: 'http://localhost:4000',
        },
      ]}
    />,
  )
  const executeButtons = wrapper.find('[title="Execute Query (Ctrl-Enter)"]')
  const executeButtonElement = {
    ...executeButtons.get(0),
    props: {
      onClick: jest.fn(),
    },
  }
  const executeButton = wrapper.wrap(executeButtonElement)
  expect(executeButton.length).toBe(1)
})

test('test MiddleWareApp passed default headers', () => {
  const wrapper = render(
    <MiddlewareApp
      setTitle={true}
      showNewWorkspace={false}
      headers={{ test: 'test' }}
    />,
  )
  expect(wrapper).toMatchSnapshot()
})
