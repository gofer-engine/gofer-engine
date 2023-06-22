import * as fs from 'fs'
import { setSubComponent } from './setSubComponent'
import Msg from './Message'

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8')

const msg = new Msg(hl7)

test('setSubComponent', () => {
  expect(new Msg(setSubComponent(msg.json(), 'ZZZ', 1, 1, 1, 1, 1, 'TEST')).get('ZZZ-1')).toBe('TEST')
})