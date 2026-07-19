import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Plain Node.js scripts that use CommonJS require() — they run directly
    // with `node` where require() is the standard. The no-require-imports rule
    // is meant for src/ (Next.js ESM context), not for standalone CLI tools.
    'scripts/convert-latex-sonnets.js',
    'scripts/parse-du-bellay.js',
    'scripts/format-json.js',
    'scripts/lib/',
  ]),
])

export default eslintConfig
