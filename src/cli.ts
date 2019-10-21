#!/usr/bin/env node

import cli from 'yargs'
import dedent from 'dedent'
import { NowDotenv } from './now-dotenv'

cli.scriptName(`now-dotenv`)

cli.usage(dedent`
    now-dotenv

    Simple cli tool for managing Zeit Now v2 secrets with dotenv files (supports multi-stages 🙌)

    README: https://github.com/vadistic/now-dotenv
  `)

cli.options({
  token: {
    alias: 't',
    required: false,
    type: 'string',
    description: `Zeit Now API token (@default: process.env.NOW_TOKEN)`,
  },

  stage: {
    alias: 's',
    required: false,
    type: 'string',
    description: `Stage name, eg. "development (@default: no staging)`,
  },

  name: {
    alias: 'n',
    required: false,
    type: 'string',
    description: `Project name (@default: from now.json / package.json)`,
  },

  env: {
    alias: 'e',
    required: false,
    type: 'string',
    description: `Dotenv file path (@default: .env.stage / .env)`,
  },

  project: {
    alias: 'p',
    required: false,
    type: 'string',
    description: `Location of now.json (@default: now.stage.json / now.json)`,
  },

  api: {
    alias: 'a',
    required: false,
    type: 'boolean',
    description: `Sync now secrets api (@default: true)`,
  },

  json: {
    alias: 'j',
    required: false,
    type: 'boolean',
    description: `Sync now.stage.json (@default: true)`,
  },

  overwrite: {
    alias: 'o',
    required: false,
    type: 'boolean',
    description: `Overwrite whole now.stage.json (@default: false)`,
  },

  codegen: {
    alias: 'c',
    required: false,
    type: 'string',
    description: `Path for proces.env typings (@default: disabled)`,
  },

  verbose: {
    alias: 'v',
    required: false,
    type: 'boolean',
    description: `Log verboose (@default: false)`,
  },
})

cli.command(`sync`, `Main (can be skipped)`)

cli.command(`codegen`, `Only codegen`)

cli.command(`reset`, `Delete Now Secrets`, reset =>
  reset.options({
    all: {
      type: 'boolean',
      description: `Reset secrets for all stages of this app`,
      required: false,
    },
  }),
)

cli.example(`now-dotenv --token TOKEN`, `minimal/ no staging`)
cli.example(
  `now-dotenv --token TOKEN --stage prod --env .env.production`,
  `stage production / specified env file location`,
)
cli.example(
  `now-dotenv --token TOKEN --stage dev --overwrite --codegen ./types/env.d.ts`,
  `stage dev/ overwite now.dev.json / codegen typings `,
)
cli.example(`now-dotenv --token TOKEN --json false --verbose`, `disable now json stuff (only sync api) / log verbose`)

cli.recommendCommands()

// nicely warp
cli.wrap(cli.terminalWidth() * 0.9)

const argv = cli.argv

const main = async () => {
  if (!argv.token && !process.env.NOW_TOKEN) {
    console.error(`Provide Now API token! https://zeit.co/account/tokens\n`)

    cli.showHelp()
    return
  }

  try {
    const api = new NowDotenv(argv as any)

    if (argv._[0] === 'reset') {
      await api.reset({ staged: !argv.all })

      console.log(`Secrets reset!`)
      return
    }

    if (argv._[0] === 'codegen') {
      api.codegen()

      console.log(`Typings ready!`)
      return
    }

    if (argv._[0] === 'sync' || argv._[0] === undefined) {
      await api.exec()

      console.log(`NowDotenv: Done!`)
      return
    }
  } catch (e) {
    console.error(`Some problems...\n`)
    console.error(e)
    return
  }

  console.error(`Invalid options!`)
  cli.showHelp()
}

main()
