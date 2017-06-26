module.exports = wallaby => ({
  files: ['src/**/*.ts', '!src/**/*.unit.ts', 'package.json'],

  tests: ['src/**/*.unit.ts'],
  compilers: {
    '**/*.ts*': wallaby.compilers.typeScript({
      module: 'commonjs',
      jsx: 'react'
    })
  },

  env: {
    type: 'node',
    runner: 'node'
  },

  testFramework: 'jest',

  setup(wallaby) {
    const jestConfig = require('./package.json').jest
    jestConfig.globals = { __DEV__: true }
    wallaby.testFramework.configure(jestConfig)
  }
})
