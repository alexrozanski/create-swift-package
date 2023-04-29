module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }]
  },
  testPathIgnorePatterns: ['./dist']
};
