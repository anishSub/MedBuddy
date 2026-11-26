import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "coverage/**",
    ],
  },
  ...coreWebVitals,
  {
    rules: {
      // The app intentionally loads data in effects (setState after async fetch)
      // and uses manual useCallback memoization; these new React Compiler-era
      // lint rules flag those patterns as errors.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
    },
  },
];
