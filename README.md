## workspaces-affected

This tool is providing support for running operations only on affected packages in your [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces#defining-workspaces)

## Usage:
```
npx workspaces-affected@latest build --base origin/master
```

### `--base` flag
base can be any git ref, for example:
```
npx workspaces-affected build --base COMMIT_ID
```

## npm workspaces support
This example is showing usage of `--is-present` flag and also passing `--coverage` to `test` script:
```
npx workspaces-affected@latest test --base=origin/master --if-present -- --coverage
```

## github actions example
This workflow will run check for coverage only for affected packages in the workspace:
```yaml
name: My awesome workflow
on:
  pull_request:
    branches:
      - main
jobs:
  workflow-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx workspaces-affected@latest test --base=origin/main --if-present -- --coverage
```


### `--ignore-private` flag
This will ignore private packages (packages.json `private: true`)
```
npx workspaces-affected build --base COMMIT_ID --ignore-private
```


## Options

| Flag          | Required | Default | Description                                     |
|---------------|----------|---------|-------------------------------------------------|
| --base        | true     | master  | git ref to compare changes to.                  |
| --with-side    | false    | false   | When true, listing also side affected packages. |
| --ignore-private | false    | false   | When true, private packages will be ignored.       |
