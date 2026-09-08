export default {
  testEnvironment: "node",

  testMatch: [
    "**/tests/**/*.test.js"
  ],

  setupFilesAfterEnv: [
    "./src/tests/setup.js"
  ],

  collectCoverage: true,

  coverageDirectory: "coverage",

  verbose: true,
};