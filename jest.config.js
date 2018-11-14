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
    cordova: {
      platformId: "browser",
    },
    firebase: {},
    window: {},
  },
  moduleNameMapper: {
    "CommandQueue$": "<rootDir>/src/www/__mocks__/CommandQueue",
    "^cordova/(.+)$": "<rootDir>/node_modules/cordova-js/src/common/$1"
  }
};
