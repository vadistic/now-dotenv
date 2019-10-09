# now-dotev

> Simple cli tool for managing Zeit Now v2 secrets with dotenv files (supports multi-stages 🙌)

## Why

[Now v2 Secrets](https://zeit.co/docs/v2/environment-variables-and-secrets) are great concept for safety and CI, but I'm kind of missing easy setup with `.env` files. With multiple staging enviroments and many dotenv configs - it can get a bit cumberstone.

![alt text](https://imgs.xkcd.com/comics/is_it_worth_the_time.png)

_It's veeeery specific tool but apperently it was still (barely) worth it :)_

## Features

- **upload/sync your selected `.env` file secrets with NOW API**
- **generate/sync your `now.stage.json` files with envs**
- **generate typescript typings for `process.env`**
- **support for multiple staging enviroments**
- **small programmatic API for scripting**

## Usage

```bash
  # Main

  $ now-dotenv -t TOKEN
  # Or
  $ now-dotenv sync -t TOKEN

  # Additional commands

  # Only codegen
  $ now-dotenv codegen -t TOKEN
  # Only delete tokens (--all for all stages)
  $ now-dotenv reset -t TOKEN

  # Examples

  # stage production/ modified env file location
  $ now-dotenv -t TOKEN -s prod -e .env.production
  # stage dev/ overwite now.dev.json/ codegen typings
  $ now-dotenv -t TOKEN -s dev -o -c ./types/env.d.ts
  # disable json stuff - only sync api/ log verbose
  $ now-dotenv -t TOKEN --json false -v
```

## Options

```

Options:
  --help           Show help                                                    [boolean]
  --version        Show version number                                          [boolean]
  --token, -t      Zeit Now API token (@default: process.env.NOW_TOKEN)         [string]
  --stage, -s      Stage name, eg. "development (@default: no staging)          [string]
  --name, -n       Project name (@default: from now.json / package.json)        [string]
  --env, -e        Dotenv file path (@default: .env.stage / .env)               [string]
  --project, -p    Location of now.json (@default: now.stage.json / now.json)   [string]
  --api, -a        Sync now secrets api (@default: true)                        [boolean]
  --json, -j       Sync now.stage.json (@default: true)                         [boolean]
  --overwrite, -o  Overwrite whole now.stage.json (@default: false)             [boolean]
  --codegen, -c    Path for proces.env typings (@default: disabled)             [string]
  --verbose, -v    log verboose (@default: false)                               [boolean]

```

## API

Usage same as CLI. Documented in JSDoc.

```ts
import { NowSecretsApi, NowDotenvOptions } from 'now-dotenv'

const opts: NowDotenvOptions = {}

const api = new NowDotenv(opts)

/** Synchronise secrets with now */
await api.syncApi()

/** Synchronise secrets with now.stage.json */
await api.syncJson()

/** Deletes all/staged previous secrets */
await api.clear()

/** Generates proces.env typings */
api.codegen()
```
