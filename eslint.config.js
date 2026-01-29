const tseslint = require("typescript-eslint");
const figmaPlugin = require("@figma/eslint-plugin-figma-plugins");

module.exports = tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "webpack.config.js"],
  },
  {
    files: ["src/**/*.ts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      "@figma/figma-plugins": figmaPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Figma plugin best practices
      ...figmaPlugin.configs.recommended.rules,
      // Relax rules for JSON parsing
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  }
);
