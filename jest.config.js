module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src"],
  maxWorkers: 1,
  verbose: true,
  moduleNameMapper: {
    "^firebase-admin/firestore$":
      "<rootDir>/node_modules/firebase-admin/lib/firestore/index.js",
  },
};
