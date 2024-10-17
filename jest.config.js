export default {
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.jsx'],
  testEnvironment: 'node',
};