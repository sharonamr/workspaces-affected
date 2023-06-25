## workspaces-affected

This tool is providing support for running operations only on affected packages in your [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces#defining-workspaces)

## Usage:
```
npx workspaces-affected@latest build --base master
```

### `base` flag
base can be any git ref, for example:
```
npx workspaces-affected build --base COMMIT_ID
```

## npm workspaces support
This example is showing usage of `--is-present` flag:
```
npx workspaces-affected --if-present build --base
```

## Options

| Flag          | Required | Default | Description                                     |
|---------------|----------|---------|-------------------------------------------------|
| --base        | true     | master  | git ref to compare changes to.                  |
| --withSide    | false    | false   | When true, listing also side affected packages. |
| --with-private | false    | false   | When true, listing also private packages.       |