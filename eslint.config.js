import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    rules: {
      "no-undef": "error",
      "no-unused-vars": "off"
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        alert: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        React: "readonly"
      }
    }
  }
];
