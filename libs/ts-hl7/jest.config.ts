/* eslint-disable */
export default {
  displayName: 'ts-hl7',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // coverageDirectory: '../../coverage/libs/ts-hl7',
  fakeTimers: {
    enableGlobally: true,
    now: new Date('2023-01-11T00:15:27.216Z').getTime(),
  },
};
