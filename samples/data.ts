import { StrictMessage } from "../libs/hl7/src";

export const strictJSON: StrictMessage = {
  meta: {
    encodedAt: '2023-01-11T00:15:27.216Z',
    encodingCharacters: {
      componentSep: '^',
      escapeChar: '\\',
      fieldSep: '|',
      repetitionSep: '~',
      truncateChar: undefined,
      subComponentSep: '&',
    },
    messageCode: 'PMU',
    messageControlId: 'MSGID002',
    messageStructure: 'PMU_B01',
    triggerEvent: 'B01',
    version: '2.5.1',
  },
  segments: [
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '|',
                    },
                  ],
                  value: '|',
                },
              ],
              position: 1,
              value: '|',
            },
          ],
          value: '|',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '^~\\&',
                    },
                  ],
                  value: '^~\\&',
                },
              ],
              position: 1,
              value: '^~\\&',
            },
          ],
          value: '^~\\&',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL7REG',
                    },
                  ],
                  value: 'HL7REG',
                },
              ],
              position: 1,
              value: 'HL7REG',
            },
          ],
          value: 'HL7REG',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'UH',
                    },
                  ],
                  value: 'UH',
                },
              ],
              position: 1,
              value: 'UH',
            },
          ],
          value: 'UH',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL7LAB',
                    },
                  ],
                  value: 'HL7LAB',
                },
              ],
              position: 1,
              value: 'HL7LAB',
            },
          ],
          value: 'HL7LAB',
        },
        {
          position: 6,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CH',
                    },
                  ],
                  value: 'CH',
                },
              ],
              position: 1,
              value: 'CH',
            },
          ],
          value: 'CH',
        },
        {
          position: 7,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '200702280700',
                    },
                  ],
                  value: '200702280700',
                },
              ],
              position: 1,
              value: '200702280700',
            },
          ],
          value: '200702280700',
        },
        {
          position: 8,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
        {
          position: 9,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'PMU',
                    },
                  ],
                  value: 'PMU',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'B01',
                    },
                  ],
                  value: 'B01',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'PMU_B01',
                    },
                  ],
                  value: 'PMU_B01',
                },
              ],
              position: 1,
              value: 'PMU^B01^PMU_B01',
            },
          ],
          value: 'PMU^B01^PMU_B01',
        },
        {
          position: 10,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MSGID002',
                    },
                  ],
                  value: 'MSGID002',
                },
              ],
              position: 1,
              value: 'MSGID002',
            },
          ],
          value: 'MSGID002',
        },
        {
          position: 11,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'P',
                    },
                  ],
                  value: 'P',
                },
              ],
              position: 1,
              value: 'P',
            },
          ],
          value: 'P',
        },
        {
          position: 12,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '2.5.1',
                    },
                  ],
                  value: '2.5.1',
                },
              ],
              position: 1,
              value: '2.5.1',
            },
          ],
          value: '2.5.1',
        },
        {
          position: 13,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'MSH',
      position: 1,
      value:
        'MSH|^~\\&|HL7REG|UH|HL7LAB|CH|200702280700||PMU^B01^PMU_B01|MSGID002|P|2.5.1|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'B01',
                    },
                  ],
                  value: 'B01',
                },
              ],
              position: 1,
              value: 'B01',
            },
          ],
          value: 'B01',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '200702280700',
                    },
                  ],
                  value: '200702280700',
                },
              ],
              position: 1,
              value: '200702280700',
            },
          ],
          value: '200702280700',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'EVN',
      position: 2,
      value: 'EVN|B01|200702280700|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'U2246',
                    },
                  ],
                  value: 'U2246',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'PLW',
                    },
                  ],
                  value: 'PLW',
                },
              ],
              position: 1,
              value: 'U2246^^^PLW',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '111223333',
                    },
                  ],
                  value: '111223333',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'USSSA',
                    },
                  ],
                  value: 'USSSA',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SS',
                    },
                  ],
                  value: 'SS',
                },
              ],
              position: 2,
              value: '111223333^^^USSSA^SS',
            },
          ],
          value: 'U2246^^^PLW~111223333^^^USSSA^SS',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HIPPOCRATES',
                    },
                  ],
                  value: 'HIPPOCRATES',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HAROLD',
                    },
                  ],
                  value: 'HAROLD',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'H',
                    },
                  ],
                  value: 'H',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'JR',
                    },
                  ],
                  value: 'JR',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DR',
                    },
                  ],
                  value: 'DR',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M.D.',
                    },
                  ],
                  value: 'M.D.',
                },
              ],
              position: 1,
              value: 'HIPPOCRATES^HAROLD^H^JR^DR^M.D.',
            },
          ],
          value: 'HIPPOCRATES^HAROLD^H^JR^DR^M.D.',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'P',
                    },
                  ],
                  value: 'P',
                },
              ],
              position: 1,
              value: 'P',
            },
          ],
          value: 'P',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M',
                    },
                  ],
                  value: 'M',
                },
              ],
              position: 1,
              value: 'M',
            },
          ],
          value: 'M',
        },
        {
          position: 6,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '19511004',
                    },
                  ],
                  value: '19511004',
                },
              ],
              position: 1,
              value: '19511004',
            },
          ],
          value: '19511004',
        },
        {
          position: 7,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'A',
                    },
                  ],
                  value: 'A',
                },
              ],
              position: 1,
              value: 'A',
            },
          ],
          value: 'A',
        },
        {
          position: 8,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ICU',
                    },
                  ],
                  value: 'ICU',
                },
              ],
              position: 1,
              value: '^ICU',
            },
          ],
          value: '^ICU',
        },
        {
          position: 9,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MED',
                    },
                  ],
                  value: 'MED',
                },
              ],
              position: 1,
              value: '^MED',
            },
          ],
          value: '^MED',
        },
        {
          position: 10,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '(555)555-1003X345',
                    },
                  ],
                  value: '(555)555-1003X345',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'C',
                    },
                  ],
                  value: 'C',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'O',
                    },
                  ],
                  value: 'O',
                },
              ],
              position: 1,
              value: '(555)555-1003X345^C^O',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '(555)555-3334',
                    },
                  ],
                  value: '(555)555-3334',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'C',
                    },
                  ],
                  value: 'C',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'H',
                    },
                  ],
                  value: 'H',
                },
              ],
              position: 2,
              value: '(555)555-3334^C^H',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '(555)555-1345X789',
                    },
                  ],
                  value: '(555)555-1345X789',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'C',
                    },
                  ],
                  value: 'C',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'B',
                    },
                  ],
                  value: 'B',
                },
              ],
              position: 3,
              value: '(555)555-1345X789^C^B',
            },
          ],
          value:
            '(555)555-1003X345^C^O~(555)555-3334^C^H~(555)555-1345X789^C^B',
        },
        {
          position: 11,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1003 HEALTHCARE DRIVE',
                    },
                  ],
                  value: '1003 HEALTHCARE DRIVE',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SUITE 200',
                    },
                  ],
                  value: 'SUITE 200',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ANNARBOR',
                    },
                  ],
                  value: 'ANNARBOR',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MI',
                    },
                  ],
                  value: 'MI',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: '98199',
                    },
                  ],
                  value: '98199',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'H',
                    },
                  ],
                  value: 'H',
                },
              ],
              position: 1,
              value: '1003 HEALTHCARE DRIVE^SUITE 200^ANNARBOR^MI^98199^H',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '3029 HEALTHCARE DRIVE',
                    },
                  ],
                  value: '3029 HEALTHCARE DRIVE',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ANNARBOR',
                    },
                  ],
                  value: 'ANNARBOR',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MI',
                    },
                  ],
                  value: 'MI',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: '98198',
                    },
                  ],
                  value: '98198',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'O',
                    },
                  ],
                  value: 'O',
                },
              ],
              position: 2,
              value: '3029 HEALTHCARE DRIVE^^ANNARBOR^MI^98198^O',
            },
          ],
          value:
            '1003 HEALTHCARE DRIVE^SUITE 200^ANNARBOR^MI^98199^H~3029 HEALTHCARE DRIVE^^ANNARBOR^MI^98198^O',
        },
        {
          position: 12,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '19890125',
                    },
                  ],
                  value: '19890125',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DOCTORSAREUS MEDICAL SCHOOL',
                    },
                    {
                      position: 2,
                      value: 'L01',
                    },
                  ],
                  value: 'DOCTORSAREUS MEDICAL SCHOOL&L01',
                },
              ],
              position: 1,
              value: '19890125^DOCTORSAREUS MEDICAL SCHOOL&L01',
            },
          ],
          value: '19890125^DOCTORSAREUS MEDICAL SCHOOL&L01',
        },
        {
          position: 13,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
        {
          position: 14,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'PMF88123453334',
                    },
                  ],
                  value: 'PMF88123453334',
                },
              ],
              position: 1,
              value: 'PMF88123453334',
            },
          ],
          value: 'PMF88123453334',
        },
        {
          position: 15,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '74160.2326@COMPUSERV.COM',
                    },
                  ],
                  value: '74160.2326@COMPUSERV.COM',
                },
              ],
              position: 1,
              value: '74160.2326@COMPUSERV.COM',
            },
          ],
          value: '74160.2326@COMPUSERV.COM',
        },
        {
          position: 16,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'B',
                    },
                  ],
                  value: 'B',
                },
              ],
              position: 1,
              value: 'B',
            },
          ],
          value: 'B',
        },
      ],
      name: 'STF',
      position: 3,
      value:
        'STF||U2246^^^PLW~111223333^^^USSSA^SS|HIPPOCRATES^HAROLD^H^JR^DR^M.D.|P|M|19511004|A|^ICU|^MED|(555)555-1003X345^C^O~(555)555-3334^C^H~(555)555-1345X789^C^B|1003 HEALTHCARE DRIVE^SUITE 200^ANNARBOR^MI^98199^H~3029 HEALTHCARE DRIVE^^ANNARBOR^MI^98198^O|19890125^DOCTORSAREUS MEDICAL SCHOOL&L01||PMF88123453334|74160.2326@COMPUSERV.COM|B',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HIPPOCRATES FAMILY PRACTICE',
                    },
                  ],
                  value: 'HIPPOCRATES FAMILY PRACTICE',
                },
              ],
              position: 1,
              value: '^HIPPOCRATES FAMILY PRACTICE',
            },
          ],
          value: '^HIPPOCRATES FAMILY PRACTICE',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ST',
                    },
                  ],
                  value: 'ST',
                },
              ],
              position: 1,
              value: 'ST',
            },
          ],
          value: 'ST',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'I',
                    },
                  ],
                  value: 'I',
                },
              ],
              position: 1,
              value: 'I',
            },
          ],
          value: 'I',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'OB/GYN',
                    },
                  ],
                  value: 'OB/GYN',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'STATE BOARD OF OBSTETRICS AND GYNECOLOGY',
                    },
                  ],
                  value: 'STATE BOARD OF OBSTETRICS AND GYNECOLOGY',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'C',
                    },
                  ],
                  value: 'C',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: '19790123',
                    },
                  ],
                  value: '19790123',
                },
              ],
              position: 1,
              value:
                'OB/GYN^STATE BOARD OF OBSTETRICS AND GYNECOLOGY^C^19790123',
            },
          ],
          value: 'OB/GYN^STATE BOARD OF OBSTETRICS AND GYNECOLOGY^C^19790123',
        },
        {
          position: 6,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1234887609',
                    },
                  ],
                  value: '1234887609',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'UPIN',
                    },
                  ],
                  value: 'UPIN',
                },
              ],
              position: 1,
              value: '1234887609^UPIN',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1234987',
                    },
                  ],
                  value: '1234987',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CTY',
                    },
                  ],
                  value: 'CTY',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MECOSTA',
                    },
                  ],
                  value: 'MECOSTA',
                },
              ],
              position: 2,
              value: '1234987^CTY^MECOSTA',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '223987654',
                    },
                  ],
                  value: '223987654',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'TAX',
                    },
                  ],
                  value: 'TAX',
                },
              ],
              position: 3,
              value: '223987654^TAX',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1234987757',
                    },
                  ],
                  value: '1234987757',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DEA',
                    },
                  ],
                  value: 'DEA',
                },
              ],
              position: 4,
              value: '1234987757^DEA',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '12394433879',
                    },
                  ],
                  value: '12394433879',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MDD',
                    },
                  ],
                  value: 'MDD',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CA',
                    },
                  ],
                  value: 'CA',
                },
              ],
              position: 5,
              value: '12394433879^MDD^CA',
            },
          ],
          value:
            '1234887609^UPIN~1234987^CTY^MECOSTA~223987654^TAX~1234987757^DEA~12394433879^MDD^CA',
        },
        {
          position: 7,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ADMIT',
                    },
                    {
                      position: 2,
                      value: 'T',
                    },
                    {
                      position: 3,
                      value: 'ADT',
                    },
                  ],
                  value: 'ADMIT&T&ADT',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MED',
                    },
                    {
                      position: 2,
                      value: '',
                    },
                    {
                      position: 3,
                      value: 'L2',
                    },
                  ],
                  value: 'MED&&L2',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '19941231',
                    },
                  ],
                  value: '19941231',
                },
              ],
              position: 1,
              value: 'ADMIT&T&ADT^MED&&L2^19941231',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DISCH',
                    },
                    {
                      position: 2,
                      value: '',
                    },
                    {
                      position: 3,
                      value: 'ADT',
                    },
                  ],
                  value: 'DISCH&&ADT',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MED',
                    },
                    {
                      position: 2,
                      value: '',
                    },
                    {
                      position: 3,
                      value: 'L2',
                    },
                  ],
                  value: 'MED&&L2',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '19941231',
                    },
                  ],
                  value: '19941231',
                },
              ],
              position: 2,
              value: 'DISCH&&ADT^MED&&L2^19941231',
            },
          ],
          value: 'ADMIT&T&ADT^MED&&L2^19941231~DISCH&&ADT^MED&&L2^19941231',
        },
        {
          position: 8,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'PRA',
      position: 4,
      value:
        'PRA||^HIPPOCRATES FAMILY PRACTICE|ST|I|OB/GYN^STATE BOARD OF OBSTETRICS AND GYNECOLOGY^C^19790123|1234887609^UPIN~1234987^CTY^MECOSTA~223987654^TAX~1234987757^DEA~12394433879^MDD^CA|ADMIT&T&ADT^MED&&L2^19941231~DISCH&&ADT^MED&&L2^19941231|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
              ],
              position: 1,
              value: '1',
            },
          ],
          value: '1',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'AMERICAN MEDICAL ASSOCIATION',
                    },
                  ],
                  value: 'AMERICAN MEDICAL ASSOCIATION',
                },
              ],
              position: 1,
              value: 'AMERICAN MEDICAL ASSOCIATION',
            },
          ],
          value: 'AMERICAN MEDICAL ASSOCIATION',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '123 MAIN STREET',
                    },
                  ],
                  value: '123 MAIN STREET',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'OUR TOWN',
                    },
                  ],
                  value: 'OUR TOWN',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CA',
                    },
                  ],
                  value: 'CA',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: '98765',
                    },
                  ],
                  value: '98765',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'U.S.A.',
                    },
                  ],
                  value: 'U.S.A.',
                },
                {
                  position: 7,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M ',
                    },
                  ],
                  value: 'M ',
                },
              ],
              position: 1,
              value: '123 MAIN STREET^^OUR TOWN^CA^98765^U.S.A.^M ',
            },
          ],
          value: '123 MAIN STREET^^OUR TOWN^CA^98765^U.S.A.^M ',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '19900101',
                    },
                  ],
                  value: '19900101',
                },
              ],
              position: 1,
              value: '19900101',
            },
          ],
          value: '19900101',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'AFF',
      position: 5,
      value:
        'AFF|1|AMERICAN MEDICAL ASSOCIATION|123 MAIN STREET^^OUR TOWN^CA^98765^U.S.A.^M |19900101|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
              ],
              position: 1,
              value: '1',
            },
          ],
          value: '1',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ESL',
                    },
                  ],
                  value: 'ESL',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SPANISH',
                    },
                  ],
                  value: 'SPANISH',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ISO639',
                    },
                  ],
                  value: 'ISO639',
                },
              ],
              position: 1,
              value: 'ESL^SPANISH^ISO639',
            },
          ],
          value: 'ESL^SPANISH^ISO639',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'READ',
                    },
                  ],
                  value: 'READ',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70403',
                    },
                  ],
                  value: 'HL70403',
                },
              ],
              position: 1,
              value: '1^READ^HL70403',
            },
          ],
          value: '1^READ^HL70403',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'EXCELLENT',
                    },
                  ],
                  value: 'EXCELLENT',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70404',
                    },
                  ],
                  value: 'HL70404',
                },
              ],
              position: 1,
              value: '1^EXCELLENT^HL70404',
            },
          ],
          value: '1^EXCELLENT^HL70404',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'LAN',
      position: 6,
      value: 'LAN|1|ESL^SPANISH^ISO639|1^READ^HL70403|1^EXCELLENT^HL70404|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '2',
                    },
                  ],
                  value: '2',
                },
              ],
              position: 1,
              value: '2',
            },
          ],
          value: '2',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ESL',
                    },
                  ],
                  value: 'ESL',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SPANISH',
                    },
                  ],
                  value: 'SPANISH',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ISO639',
                    },
                  ],
                  value: 'ISO639',
                },
              ],
              position: 1,
              value: 'ESL^SPANISH^ISO639',
            },
          ],
          value: 'ESL^SPANISH^ISO639',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '2',
                    },
                  ],
                  value: '2',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'WRITE',
                    },
                  ],
                  value: 'WRITE',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70403',
                    },
                  ],
                  value: 'HL70403',
                },
              ],
              position: 1,
              value: '2^WRITE^HL70403',
            },
          ],
          value: '2^WRITE^HL70403',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '2',
                    },
                  ],
                  value: '2',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'GOOD',
                    },
                  ],
                  value: 'GOOD',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70404',
                    },
                  ],
                  value: 'HL70404',
                },
              ],
              position: 1,
              value: '2^GOOD^HL70404',
            },
          ],
          value: '2^GOOD^HL70404',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'LAN',
      position: 7,
      value: 'LAN|2|ESL^SPANISH^ISO639|2^WRITE^HL70403|2^GOOD^HL70404|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '3',
                    },
                  ],
                  value: '3',
                },
              ],
              position: 1,
              value: '3',
            },
          ],
          value: '3',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'FRE',
                    },
                  ],
                  value: 'FRE',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'FRENCH',
                    },
                  ],
                  value: 'FRENCH',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'ISO639',
                    },
                  ],
                  value: 'ISO639',
                },
              ],
              position: 1,
              value: 'FRE^FRENCH^ISO639',
            },
          ],
          value: 'FRE^FRENCH^ISO639',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '3',
                    },
                  ],
                  value: '3',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SPEAK',
                    },
                  ],
                  value: 'SPEAK',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70403',
                    },
                  ],
                  value: 'HL70403',
                },
              ],
              position: 1,
              value: '3^SPEAK^HL70403',
            },
          ],
          value: '3^SPEAK^HL70403',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '3',
                    },
                  ],
                  value: '3',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'FAIR',
                    },
                  ],
                  value: 'FAIR',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70404',
                    },
                  ],
                  value: 'HL70404',
                },
              ],
              position: 1,
              value: '3^FAIR^HL70404',
            },
          ],
          value: '3^FAIR^HL70404',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'LAN',
      position: 8,
      value: 'LAN|3|FRE^FRENCH^ISO639|3^SPEAK^HL70403|3^FAIR^HL70404|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
              ],
              position: 1,
              value: '1',
            },
          ],
          value: '1',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'BA',
                    },
                  ],
                  value: 'BA',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'BACHELOR OF ARTS',
                    },
                  ],
                  value: 'BACHELOR OF ARTS',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70360',
                    },
                  ],
                  value: 'HL70360',
                },
              ],
              position: 1,
              value: 'BA^BACHELOR OF ARTS^HL70360',
            },
          ],
          value: 'BA^BACHELOR OF ARTS^HL70360',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '19810901',
                    },
                  ],
                  value: '19810901',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '19850601',
                    },
                  ],
                  value: '19850601',
                },
              ],
              position: 1,
              value: '19810901^19850601',
            },
          ],
          value: '19810901^19850601',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'YALE UNIVERSITY',
                    },
                  ],
                  value: 'YALE UNIVERSITY',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'L',
                    },
                  ],
                  value: 'L',
                },
              ],
              position: 1,
              value: 'YALE UNIVERSITY^L',
            },
          ],
          value: 'YALE UNIVERSITY^L',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'U',
                    },
                  ],
                  value: 'U',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70402',
                    },
                  ],
                  value: 'HL70402',
                },
              ],
              position: 1,
              value: 'U^HL70402',
            },
          ],
          value: 'U^HL70402',
        },
        {
          position: 6,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '456 CONNECTICUT AVENUE',
                    },
                  ],
                  value: '456 CONNECTICUT AVENUE',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'NEW HAVEN',
                    },
                  ],
                  value: 'NEW HAVEN',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CO',
                    },
                  ],
                  value: 'CO',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: '87654',
                    },
                  ],
                  value: '87654',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'U.S.A.',
                    },
                  ],
                  value: 'U.S.A.',
                },
                {
                  position: 7,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M',
                    },
                  ],
                  value: 'M',
                },
              ],
              position: 1,
              value: '456 CONNECTICUT AVENUE^^NEW HAVEN^CO^87654^U.S.A.^M',
            },
          ],
          value: '456 CONNECTICUT AVENUE^^NEW HAVEN^CO^87654^U.S.A.^M',
        },
        {
          position: 7,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'EDU',
      position: 9,
      value:
        'EDU|1|BA^BACHELOR OF ARTS^HL70360|19810901^19850601|YALE UNIVERSITY^L|U^HL70402|456 CONNECTICUT AVENUE^^NEW HAVEN^CO^87654^U.S.A.^M|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '2',
                    },
                  ],
                  value: '2',
                },
              ],
              position: 1,
              value: '2',
            },
          ],
          value: '2',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MD',
                    },
                  ],
                  value: 'MD',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DOCTOR OF MEDICINE',
                    },
                  ],
                  value: 'DOCTOR OF MEDICINE',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70360',
                    },
                  ],
                  value: 'HL70360',
                },
              ],
              position: 1,
              value: 'MD^DOCTOR OF MEDICINE^HL70360',
            },
          ],
          value: 'MD^DOCTOR OF MEDICINE^HL70360',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '19850901',
                    },
                  ],
                  value: '19850901',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '19890601',
                    },
                  ],
                  value: '19890601',
                },
              ],
              position: 1,
              value: '19850901^19890601',
            },
          ],
          value: '19850901^19890601',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HARVARD MEDICAL SCHOOL',
                    },
                  ],
                  value: 'HARVARD MEDICAL SCHOOL',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'L ',
                    },
                  ],
                  value: 'L ',
                },
              ],
              position: 1,
              value: 'HARVARD MEDICAL SCHOOL^L ',
            },
          ],
          value: 'HARVARD MEDICAL SCHOOL^L ',
        },
        {
          position: 5,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M',
                    },
                  ],
                  value: 'M',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL70402',
                    },
                  ],
                  value: 'HL70402',
                },
              ],
              position: 1,
              value: 'M^HL70402',
            },
          ],
          value: 'M^HL70402',
        },
        {
          position: 6,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '123 MASSACHUSETTS AVENUE',
                    },
                  ],
                  value: '123 MASSACHUSETTS AVENUE',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'CAMBRIDGE',
                    },
                  ],
                  value: 'CAMBRIDGE',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'MA',
                    },
                  ],
                  value: 'MA',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: '76543',
                    },
                  ],
                  value: '76543',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'U.S.A.',
                    },
                  ],
                  value: 'U.S.A.',
                },
                {
                  position: 6,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M',
                    },
                  ],
                  value: 'M',
                },
              ],
              position: 1,
              value: '123 MASSACHUSETTS AVENUE^CAMBRIDGE^MA^76543^U.S.A.^M',
            },
          ],
          value: '123 MASSACHUSETTS AVENUE^CAMBRIDGE^MA^76543^U.S.A.^M',
        },
        {
          position: 7,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'EDU',
      position: 10,
      value:
        'EDU|2|MD^DOCTOR OF MEDICINE^HL70360|19850901^19890601|HARVARD MEDICAL SCHOOL^L |M^HL70402|123 MASSACHUSETTS AVENUE^CAMBRIDGE^MA^76543^U.S.A.^M|',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'Source',
                    },
                  ],
                  value: 'Source',
                },
              ],
              position: 1,
              value: 'Source',
            },
          ],
          value: 'Source',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'HL7 Version 2.5.1 Standard',
                    },
                  ],
                  value: 'HL7 Version 2.5.1 Standard',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: 'Chapter',
                    },
                    {
                      position: 2,
                      value: '15',
                    },
                    {
                      position: 3,
                      value: 'Personnel Management',
                    },
                  ],
                  value: 'Chapter&15&Personnel Management',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: 'Section',
                    },
                    {
                      position: 2,
                      value: '5',
                    },
                    {
                      position: 3,
                      value: 'Example Transactions',
                    },
                  ],
                  value: 'Section&5&Example Transactions',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'Page',
                    },
                    {
                      position: 2,
                      value: '15-40',
                    },
                  ],
                  value: 'Page&15-40',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'Date',
                    },
                    {
                      position: 2,
                      value: '200704',
                    },
                  ],
                  value: 'Date&200704',
                },
              ],
              position: 1,
              value:
                'HL7 Version 2.5.1 Standard^Chapter&15&Personnel Management^Section&5&Example Transactions^Page&15-40^Date&200704',
            },
          ],
          value:
            'HL7 Version 2.5.1 Standard^Chapter&15&Personnel Management^Section&5&Example Transactions^Page&15-40^Date&200704',
        },
      ],
      name: 'ZZZ',
      position: 11,
      value:
        'ZZZ|Source|HL7 Version 2.5.1 Standard^Chapter&15&Personnel Management^Section&5&Example Transactions^Page&15-40^Date&200704',
    },
    {
      fields: [
        {
          position: 1,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
              ],
              position: 1,
              value: '1',
            },
          ],
          value: '1',
        },
        {
          position: 2,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
        {
          position: 3,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '1',
                    },
                  ],
                  value: '1',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'DB',
                    },
                  ],
                  value: 'DB',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'SQL',
                    },
                  ],
                  value: 'SQL',
                },
              ],
              position: 1,
              value: '1^^^DB^SQL',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'M1',
                    },
                  ],
                  value: 'M1',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: 'EHR',
                    },
                  ],
                  value: 'EHR',
                },
              ],
              position: 2,
              value: 'M1^^^EHR',
            },
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: 'R1',
                    },
                  ],
                  value: 'R1',
                },
                {
                  position: 2,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 3,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 4,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
                {
                  position: 5,
                  subComponents: [
                    {
                      position: 1,
                      value: 'RAD',
                    },
                  ],
                  value: 'RAD',
                },
              ],
              position: 3,
              value: 'R1^^^^RAD',
            },
          ],
          value: '1^^^DB^SQL~M1^^^EHR~R1^^^^RAD',
        },
        {
          position: 4,
          repetitions: [
            {
              components: [
                {
                  position: 1,
                  subComponents: [
                    {
                      position: 1,
                      value: '',
                    },
                  ],
                  value: '',
                },
              ],
              position: 1,
              value: '',
            },
          ],
          value: '',
        },
      ],
      name: 'PID',
      position: 12,
      value: 'PID|1||1^^^DB^SQL~M1^^^EHR~R1^^^^RAD|',
    },
  ],
}
