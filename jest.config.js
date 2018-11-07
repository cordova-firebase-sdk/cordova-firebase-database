module.exports = {
  roots: [
    "<rootDir>/src/"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "testPathIgnorePatterns": [
    "node_modules/*"
  ],
  globals: {
    cordova: {},
    firebase: {},
    window: {},
  },
  moduleNameMapper: {
    "^cordova$": "<rootDir>/node_modules/cordova-firebase-core/src/www/__test__/cordova",
    "CommandQueue$": "<rootDir>/src/www/__mocks__/CommandQueue"
  }
};
