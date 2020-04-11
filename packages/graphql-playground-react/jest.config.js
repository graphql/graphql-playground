module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^.+\\.tsx?$': '<rootDir>/config/jest/typescriptTransform.js',
    '^(?!.*\\.(css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  testPathIgnorePatterns: ['<rootDir>[/\\\\](build|docs|node_modules)[/\\\\]'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupTestFrameworkScriptFile: '<rootDir>/src/setupEnzyme.ts',
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.jest.json',
    },
  },
  testURL: 'https://localhost',
  setupFiles: ['<rootDir>/config/polyfills.js', 'jest-localstorage-mock'],
}
