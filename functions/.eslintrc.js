/* eslint-env node */
module.exports = {
  env: {
    es6: true,
    node: true,  // 添加 node 环境
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["error", {"code": 120}],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {
    "module": "readonly",
    "require": "readonly",
    "exports": "readonly",
    "process": "readonly",
    "setGlobalOptions": "readonly",
  },
};
