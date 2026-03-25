module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src"],
  maxWorkers: 1,
  verbose: true,
  moduleNameMapper: {
    "^firebase-admin/(.*)$": "<rootDir>/node_modules/firebase-admin/lib/$1/index.js",
  },
};
