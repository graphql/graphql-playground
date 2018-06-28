import * as React from 'react'
import { shallow } from 'enzyme'
import MiddlewareApp from './components/MiddlewareApp'

test('test middleware app', () => {
  const wrapper = shallow(
    <MiddlewareApp setTitle={true} showNewWorkspace={false} />,
  )
  expect(wrapper).toMatchSnapshot()
})
