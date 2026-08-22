import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // The codebase marks intentionally-unused args with a leading underscore.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Canvas sims are built around mutable refs driven by a rAF loop: control
    // params are detected-and-reset and live readouts are sampled by reading
    // ref state during render (values refresh on re-render). react-hooks/refs
    // targets stale-render bugs in ordinary components and does not fit here.
    files: ["components/concepts/sims/**"],
    rules: {
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
