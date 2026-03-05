module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: [
    ".eslintrc.js",
    "jest.config.js",
    "ormconfig.ts",
    "swaggerDef.js",
  ],
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off", // Disable unused variable warnings since eslint cannot recognize decoraters as being used
  },
};
