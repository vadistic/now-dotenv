# now-dotev

> Simple cli tool for managing now secrets with dotenv files across stages.

## Why

[Now v2 Secrets](https://zeit.co/docs/v2/environment-variables-and-secrets) are great concept for safety and CI, but I'm kind of missing easy setup with `.env` files.

With multiple staging enviroments and many dotenv configs it can get a bit cumberstone.

## Features

- **upload/sync your selected `.env` file secrets with NOW API**
- **generate/sync your `now.stage.json` files with envs**
- **generate typescript typings for `process.env`**
- **support for multiple staging enviroments**
- **small programmatic API for scripting**

## Usage

## Flags

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
