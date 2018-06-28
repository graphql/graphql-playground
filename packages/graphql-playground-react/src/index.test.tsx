import * as React from 'react'
import { mount } from 'enzyme'
import MiddlewareApp from './components/MiddlewareApp'

test('test middleware app', () => {
  const wrapper = mount(
    <MiddlewareApp setTitle={true} showNewWorkspace={false} />,
  )
  expect(wrapper).toMatchSnapshot()
})
