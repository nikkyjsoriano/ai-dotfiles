# TypeScript starter pack

This is the reusable baseline extracted from the Beyblade AIO project for
TypeScript repositories. It keeps linting strict enough to catch unused code,
unsafe TypeScript, import problems, suppression comments, and overly complex
functions without requiring an Expo or React project.

## Install in a project

Install the config's peer dependencies in the project:

```sh
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-prettier \
  eslint-plugin-import \
  eslint-plugin-unused-imports \
  typescript
```

Copy or symlink the starter files into the project root:

```sh
cp /path/to/ai-dotfiles/typescript/eslint.config.js ./eslint.config.js
cp /path/to/ai-dotfiles/typescript/tsconfig.base.json ./tsconfig.base.json
```

Then extend the compiler baseline from the project's `tsconfig.json`:

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Run `eslint .` and `tsc --noEmit` from the project scripts. Projects with
framework-specific requirements can add a config block before the final
Prettier block in `eslint.config.js`.

## Provenance

The rules originated in `beybladeAIO/eslint.config.js` and
`beybladeAIO/tsconfig.json`. Expo-specific presets, React Native globals, and
path aliases stay in individual projects rather than this shared baseline.
