module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/*.test.js", "**/*.spec.js"],
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{js,ts}", "!**/node_modules/**", "!coverage/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  verbose: true,
};
