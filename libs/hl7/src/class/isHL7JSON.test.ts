import Msg from './Message'
import { isMessage, isSegment, isField, isComponent } from './isHL7JSON'

test('isMessage', () => {
  expect(isMessage(undefined)).toBeFalsy()
  expect(isMessage([])).toBeFalsy()
  expect(isMessage([null])).toBeFalsy()
  expect(isMessage([{ foo: 42 }])).toBeFalsy()
  expect(isMessage(new Msg('PID|1\r\nZZZ|1').json())).toBeTruthy()
})

