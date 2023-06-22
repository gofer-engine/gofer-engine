/* eslint-disable @nx/enforce-module-boundaries */
import * as fs from 'fs'
import { Msg } from '../src'
import HL7Json from '../../../samples/sample.json'
import { strictJSON } from '../../../samples/data'
import { Fld } from '../src/class/Field'
import { Cmp } from '../src/class/Component'

const HL7 = fs.readFileSync('./samples/sample.hl7', 'utf8')

const msg = new Msg(HL7)

const tests: Record<string, { path: string; expected: unknown }> = {
  Source: {
    path: 'ZZZ.2',
    expected: [
      'HL7 Version 2.5.1 Standard',
      ['Chapter', '15', 'Personnel Management'],
      ['Section', '5', 'Example Transactions'],
      ['Page', '15-40'],
      ['Date', '200704'],
    ],
  },
  SendingApplication: {
    path: 'MSH-3',
    expected: 'HL7REG',
  },
  MessageDateTime: {
    path: 'MSH.7',
    expected: '200702280700',
  },
  MessageCode: {
    path: 'MSH-9.1',
    expected: 'PMU',
  },
  MessageEvent: {
    path: 'MSH.9-2',
    expected: 'B01',
  },
  MessageControlID: {
    path: 'MSH.10',
    expected: 'MSGID002',
  },
  StaffIdentifierIDs: {
    path: 'STF-2.1',
    expected: ['U2246', '111223333'],
  },
  StaffSSN: {
    path: 'STF-2[2].1',
    expected: '111223333',
  },
  StaffFamilyName: {
    path: 'STF-3.1',
    expected: 'HIPPOCRATES',
  },
  StaffGivenName: {
    path: 'STF-3.2',
    expected: 'HAROLD',
  },
  StaffMiddleName: {
    path: 'STF-3.3',
    expected: 'H',
  },
  StaffSuffix: {
    path: 'STF-3.4',
    expected: 'JR',
  },
  StaffPrefix: {
    path: 'STF-3.5',
    expected: 'DR',
  },
  StaffDegree: {
    path: 'STF-3.6',
    expected: 'M.D.',
  },
  StaffType: {
    path: 'STF-4',
    expected: 'P',
  },
  StaffGender: {
    path: 'STF-5',
    expected: 'M',
  },
  StaffDoB: {
    path: 'STF-6',
    expected: '19511004',
  },
  StaffActive: {
    path: 'STF-7',
    expected: 'A',
  },
  StaffDepartment: {
    path: 'STF-8.2',
    expected: 'ICU',
  },
  StaffPhonePrimary: {
    path: 'STF-10[1].1',
    expected: '(555)555-1003X345',
  },
  Address1Street: {
    path: 'STF-11[1].1',
    expected: '1003 HEALTHCARE DRIVE',
  },
  Address1Street2: {
    path: 'STF-11[1].2',
    expected: 'SUITE 200',
  },
  Address1City: {
    path: 'STF-11[1].3',
    expected: 'ANNARBOR',
  },
  Address1State: {
    path: 'STF-11[1].4',
    expected: 'MI',
  },
  Address1Zip: {
    path: 'STF-11[1].5',
    expected: '98199',
  },
  Address1Type: {
    path: 'STF-11[1].6',
    expected: 'H',
  },
  Address2Street: {
    path: 'STF-11[2].1',
    expected: '3029 HEALTHCARE DRIVE',
  },
  Address2Street2: {
    path: 'STF-11[2].2',
    expected: null,
  },
  Address2City: {
    path: 'STF-11[2].3',
    expected: 'ANNARBOR',
  },
  Address2State: {
    path: 'STF-11[2].4',
    expected: 'MI',
  },
  Address2Zip: {
    path: 'STF-11[2].5',
    expected: '98198',
  },
  Address2Type: {
    path: 'STF-11[2].6',
    expected: 'O',
  },
  Email: {
    path: 'STF-15',
    expected: '74160.2326@COMPUSERV.COM',
  },
  PreferredContactMethod: {
    path: 'STF-16',
    expected: 'B',
  },
  PracticeGroup: {
    path: 'PRA-2.2',
    expected: 'HIPPOCRATES FAMILY PRACTICE',
  },
  Specialty: {
    path: 'PRA-5[1].1',
    expected: 'OB/GYN',
  },
  PractitionerIDs: {
    path: 'PRA-6',
    expected: [
      ['1234887609', 'UPIN'],
      ['1234987', 'CTY', 'MECOSTA'],
      ['223987654', 'TAX'],
      ['1234987757', 'DEA'],
      ['12394433879', 'MDD', 'CA'],
    ],
  },
  Priveleges: {
    path: 'PRA-7.1.1',
    expected: ['ADMIT', 'DISCH'],
  },
  Affiliations: {
    path: 'AFF-2',
    expected: 'AMERICAN MEDICAL ASSOCIATION',
  },
  Languages: {
    path: 'LAN-2.2',
    expected: ['SPANISH', 'SPANISH', 'FRENCH'],
  },
  LanguageMethod: {
    path: 'LAN-3.2',
    expected: ['READ', 'WRITE', 'SPEAK'],
  },
  LanguageProficiency: {
    path: 'LAN-4.2',
    expected: ['EXCELLENT', 'GOOD', 'FAIR'],
  },
  EducationDegree: {
    path: 'EDU-2.2',
    expected: ['BACHELOR OF ARTS', 'DOCTOR OF MEDICINE'],
  },
  EducationSchool: {
    path: 'EDU-4.1',
    expected: ['YALE UNIVERSITY', 'HARVARD MEDICAL SCHOOL'],
  },
  PRA_7: {
    path: 'PRA-7',
    expected: [
      [['ADMIT', 'T', 'ADT'], ['MED', null, 'L2'], '19941231'],
      [['DISCH', null, 'ADT'], ['MED', null, 'L2'], '19941231'],
    ],
  },
  PRA_7_1: {
    path: 'PRA-7.1',
    expected: [
      ['ADMIT', 'T', 'ADT'],
      ['DISCH', null, 'ADT'],
    ],
  },
  PRA_7_1_1: {
    path: 'PRA-7.1.1',
    expected: ['ADMIT', 'DISCH'],
  },
  PRA_7_1_2: {
    path: 'PRA-7.1.2',
    expected: ['T', null],
  },
  PRA_7first_1_2: {
    path: 'PRA-7[1].1.2',
    expected: 'T',
  },
}

const testSuite = Object.entries(tests).map(([name, { path, expected }]) => {
  return { name, path, expected }
})

test.each(testSuite)('$name', ({ path, expected }) => {
  expect(msg.get(path)).toStrictEqual(expected)
})

test('Get LAN Segment', () => {
  expect(msg.getSegment('LAN', 1).toString()).toBe(
    'LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403|1^EXCELLENT^HL70404|'
  )
})

test('Get STF-10[1] Field', () => {
  expect(msg.getSegment('STF', 1).getField(10, 1).toString()).toBe(
    '(555)555-1003X345^C^O'
  )
})

test('Get Non-Existant', () => {
  expect(msg.getSegment('XXX').json()).toBeUndefined()
  expect(msg.get('XXX')).toBeUndefined()
  expect(msg.get('XXX-1')).toBeUndefined()
  expect(msg.get('ZZZ[2]')).toBeUndefined()
  expect(msg.get('ZZZ-1[2]')).toBeUndefined()
  expect(msg.get('ZZZ-2.6')).toBeUndefined()
  expect(msg.get('ZZZ-2.2.4')).toBeUndefined()
})

test('Errors', () => {
  expect(() => msg.get('ABCD')).toThrowError("Could not parse path: ABCD")
  expect(() => msg.get('ZZZ[0]')).toThrowError("Segment Iteration in path ZZZ[0] cannot be 0.")
  expect(() => msg.get('ZZZ-0')).toThrowError("Field Position in path ZZZ-0 cannot be 0.")
  expect(() => msg.get('ZZZ-1.0')).toThrowError("Component Position in path ZZZ-1.0 cannot be 0.")
  expect(() => msg.get('ZZZ-1.1.0')).toThrowError("Sub Component Position in path ZZZ-1.1.0 cannot be 0.")
  expect(() => msg.get('ZZZ-1[0]')).toThrowError("Field Iteration in path ZZZ-1[0] cannot be 0.")
})

test('Get STF-10.1 Component', () => {
  expect(
    msg
      .getSegment('STF')
      .getField(10)
      .getComponent(1)
      .toString({ fieldRepSep: '; ' }, true)
  ).toBe('(555)555-1003X345; (555)555-3334; (555)555-1345X789')
})

test('Get STF-10[1].1 Component', () => {
  expect(msg.getSegment('ZZZ').getField(2).getComponent(2).toString()).toBe(
    'Chapter&15&Personnel Management'
  )
})

test('Get raw msg', () => {
  const raw = msg.json()
  expect(JSON.stringify(raw, undefined, 2)).toBe(
    JSON.stringify(HL7Json, undefined, 2)
  )
})

test('Encode to HL7', () => {
  expect(msg.toString()).toBe(HL7)
})

test('New Empty Msg Class', () => {
  const msg = new Msg()
  expect(msg.get('MSH-1')).toBe('|')
})

test('New Msg Class By Array', () => {
  const m = msg.json()
  const m2 = new Msg(m)
  expect(m2.toString()).toBe(HL7)
})

test('Add Segment', () => {
  msg.addSegment(['NTE', '1', 'This is a comment'])
  expect(msg.get('NTE-2')).toBe('This is a comment')
})

const msg2 = new Msg(
  'MSH!@#$%^!HL7REG!UH!HL7LAB!CH!200702280700!!PMU@B01@PMU_B01!MSGID002!P!2.8!'
)

test('Encoding Characters', () => {
  const encodingChars = msg2.json(true).meta.encodingCharacters
  expect(encodingChars).toStrictEqual({
    fieldSep: '!',
    componentSep: '@',
    repetitionSep: '#',
    escapeChar: '$',
    subComponentSep: '%',
    truncateChar: '^',
  })
})

test('Custom Encoding Get', () => {
  expect(msg2.get('MSH-9.3')).toBe('PMU_B01')
})

test('Custom Encoding Stingify', () => {
  expect(msg2.toString()).toBe(
    'MSH!@#$%^!HL7REG!UH!HL7LAB!CH!200702280700!!PMU@B01@PMU_B01!MSGID002!P!2.8!'
  )
})

test('getStrictJSON', () => {
  expect(new Msg(HL7).json(true)).toStrictEqual(strictJSON)
})

test('fromStrictJSON', () => {
  expect(new Msg(strictJSON).json()).toStrictEqual(new Msg(HL7).json())
})

// write files for manual comparison and debugging
// fs.writeFileSync(
//   './tests/StrictJSON_res.json',
//   sortify(new Msg(HL7).json(true)) ?? ''
// )
// fs.writeFileSync('./tests/StrictJSON_exp.json', sortify(strictJSON) ?? '')

test('Deeply Nested LAN Values', () => {
  const deepValues = new Msg(HL7)
    .getSegment('LAN')
    .getFields()
    .map((f: Fld | Fld[]) => {
      const mapper = (c: Cmp) => c.getSubComponents().map((s) => s.toString())
      if (Array.isArray(f)) {
        return f.map((f) => f.getComponents().map(mapper))
      }
      return f.getComponents().map(mapper)
    })
  const exp = [
    [
      [['1']],
      [['ESL'], ['SPANISH'], ['ISO639']],
      [['1'], ['READ'], ['HL70403']],
      [['1'], ['EXCELLENT'], ['HL70404']],
      [['']],
    ],
    [
      [['2']],
      [['ESL'], ['SPANISH'], ['ISO639']],
      [['2'], ['WRITE'], ['HL70403']],
      [['2'], ['GOOD'], ['HL70404']],
      [['']],
    ],
    [
      [['3']],
      [['FRE'], ['FRENCH'], ['ISO639']],
      [['3'], ['SPEAK'], ['HL70403']],
      [['3'], ['FAIR'], ['HL70404']],
      [['']],
    ],
  ]
  expect(deepValues).toEqual(exp)
})
