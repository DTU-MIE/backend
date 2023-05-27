module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  moduleDirectories: ["node_modules"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: ["**/*.js"],
  coverageReporters: ["text", "html"],
};
