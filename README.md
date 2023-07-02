# @mizdra/typescript-plugin-asset

TypeScript language service plugin supporting for importing assets.

## Demo

TODO

## Install

```console
$ npm install -D @mizdra/typescript-plugin-asset
```

## Usage

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "plugins": [
      {
        "name": "@mizdra/typescript-plugin-asset",
        "include": ["assets/**/*"],
        "extensions": [".png", ".jpg", ".svg"],
        "exportedNameCase": "constantCase",
        "exportedNamePrefix": "I_"
      }
    ]
  }
}
```

## Options

### `include` (required)

Glob pattern of assets. `@mizdra/typescript-plugin-asset` completes import statements only for assets matching this pattern.

- Type: `string[]`
- Example: `["assets/**/*"]`

### `exclude`

Glob pattern of assets to exclude. `@mizdra/typescript-plugin-asset` does not complete import statements for assets matching this pattern.

### `extensions` (required)

File extensions of assets. `@mizdra/typescript-plugin-asset` completes import statements only for assets matching this extensions.

- Type: `string[]`
- Example: `[".png", ".jpg", ".svg"]`

### `exportedNameCase`

The name case of default export in asset module.

- Type: `"constantCase" | "camelCase" | "pascalCase" | "snakeCase"`
- Default: `"constantCase"`

### `exportedNamePrefix`

The name prefix of the default export of the asset module. Must be a valid JavaScript identifier.

- Type: `string`
- Default: `"I_"`
