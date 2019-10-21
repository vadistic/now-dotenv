# now-dotev

> Handy cli tool for managing Zeit Now v2 secrets with dotenv files 🙌

## Install

```
$ yarn global add now-dotenv

$ npm install -g now-dotenv
```

## Why

I did not feel like retyping secrets this morning... So I wrote CLI that use Now API to sync your Now Secrets with `.env` files.

[Now v2 Secrets](https://zeit.co/docs/v2/environment-variables-and-secrets) are great concept for safety and CI, but `now secrets add` is quite cumberstone. Here's the fix!

## Features

- **upload/sync your selected `.env` file secrets with NOW API**
- **generate/sync your `now.stage.json` files with envs**
- **generate typescript typings for `process.env`**
- **support for multiple staging enviroments**
- **small programmatic API for scripting**

## Usage

#### Basic

```bash
  $ now-dotenv -t TOKEN
  # or
  $ now-dotenv sync --token TOKEN

```

```bash
  # .env
  MY_SECRET="ABC"

  # run now-dotenv
  $ now-dotenv -t TOKEN
  > NowDotenv: Done!

  # now api is updated
  $ now secrets ls
  > @projectname-my-secret 0d ago

  # now.json is also updated
  {
    ...
    env: {
      ...untouchedPreviousEnvs
      my-secret: @projectname-my-secret
    }
  }
```

#### Some custom use-case

```bash
  $ now-dotenv sync \
      --token TOKEN \
      # namespace as stage "prod"
      --stage prod \
      # show .env file location (.env.prod would be default)
      --env ../.env.production
      # show now.json location (now.prod.json would be default)
      --project now.production.json \
      # sync now.production.json with now.json (whole, not just envs)
      --owerwrite \
      # codegen typings for process.env
      --codegen \
      # log verboose
      --verbose \

```

#### Only delete secrets

```bash
  $ now-dotenv reset -t TOKEN
  # for all stages
  $ now-dotenv reset -t TOKEN --all
```

#### Only codegen typings for `process.env`

```bash
  $ now-dotenv codegen -t TOKEN --codegen ./types/env.d.ts
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
  --verbose, -v    Log verboose (@default: false)                               [boolean]

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

## Future

_Not really, It was already crazy to write this incerdibly specific tool :)_

Btw. you can help Zeit spec out new env system: https://github.com/zeit/now/issues/2613

![xkcd automation comic](https://imgs.xkcd.com/comics/is_it_worth_the_time.png)
