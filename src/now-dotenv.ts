import { isObject } from 'util'
import { join, basename } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import fetch, { Response } from 'node-fetch'
import dotenv from 'dotenv'
import { NowDotenvOptions, ListSecretsResponse, NowSecret, PackageJson, NowJson, Envs } from './types'

// API
// https://zeit.co/docs/api#endpoints/secrets

export class NowDotenv {
  headers: { [key: string]: string }
  options: NowDotenvOptions

  prefix: string
  projectName: string
  envs: Envs
  nowJsonName: string
  nowJsonPath: string
  token: string

  constructor(options: NowDotenvOptions) {
    this.options = {
      verbose: false,
      syncApi: true,
      syncJson: true,
      overwrite: false,
      ...options,
    }

    this.envs = this.readEnvs()

    this.projectName = this.getProjectName()
    this.prefix = this.getPrefix(this.projectName)

    this.nowJsonName = this.getNowJsonName()
    this.nowJsonPath = this.getNowJsonPath(this.nowJsonName)

    this.token = this.getToken(this.envs)

    this.headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }

    this.log(`NowDotenv for project '${this.projectName}' with prefix '${this.prefix}'`)
  }

  /** PUBLIC */

  public async exec() {
    try {
      if (this.options.syncApi) await this.syncApi()
      if (this.options.syncJson) await this.syncJson()
      if (this.options.codegen) this.codegen()
    } catch (e) {
      console.error(e)
    }

    return true
  }

  /** Synchronise secrets with now */
  public async syncApi() {
    await this.reset({ staged: true })

    this.log(`Creating now secrets...`)

    await Promise.all(
      Object.entries(this.envs).map(async ([name, value]) => this.apiCreateSecret(this.formatName(name), value)),
    )

    this.log(`Now secrets created!`)
  }

  /** Synchronise secrets for now.stage.json */
  public async syncJson() {
    if (this.options.overwrite) this.overwriteJsonEnvs()
    else this.updateJsonEnvs()
  }

  /** Deletes all/staged previous secrets */
  public async reset({ staged = true }) {
    this.log(`Deleting now secrets...`)

    const prev = await this.apiGetSecrets()
    const deduped = this.dedupeSecrets(prev, { staged })

    await Promise.all(deduped.map(async secret => this.apiDeleteSecret(secret.name)))

    this.log(`Now secrets deleted!`)
  }

  /** Generates proces.env typings */
  public codegen() {
    const typings = this.generateTypings()

    writeFileSync(join(process.cwd(), this.options.codegen || 'env.d.ts'), typings, 'utf-8')

    this.log(`Typings for process.env saved at ${this.options.codegen}`)
  }

  /** API */

  private async apiGetSecrets() {
    const res = await fetch(`https://api.zeit.co/v2/now/secrets`, {
      method: 'GET',
      headers: this.headers,
    })

    if (res.ok) {
      this.log(`GET secrets`)
      return res.json().then((res: ListSecretsResponse) => res.secrets)
    }

    throw Error(this.formatErr(res, `Cannot fetch secrets`))
  }

  private async apiDeleteSecret(name: string) {
    const res = await fetch(`https://api.zeit.co/v2/now/secrets/${name}`, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (res.ok) {
      this.log(`DELETE ${name}`)
      return true
    }

    throw Error(this.formatErr(res, `Cannot delete secret ${name}`))
  }

  private async apiCreateSecret(name: string, value: string) {
    const res = await fetch(`https://api.zeit.co/v2/now/secrets`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        name,
        value,
      }),
    })

    if (res.ok) {
      this.log(`POST ${name}`)
      return true
    }

    throw Error(this.formatErr(res, `Cannot create secret ${name}`))
  }

  /** HELPER */

  /** Overwrites envs of now json with now.json + envs */
  private updateJsonEnvs() {
    let json = this.readNowJson({ staged: true })

    if (!json) {
      return this.overwriteJsonEnvs()
    }

    if (!json.env) {
      json = { ...json, env: {} }
    }

    Object.keys(this.envs).forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      json!.env![name] = '@' + this.formatName(name)
    })

    this.writeNowJson(json)

    this.log(`Updated ${this.nowJsonName} with envs`)
  }

  /** Overwrites envs of now json with now.json + envs */
  private overwriteJsonEnvs() {
    let json = this.readNowJson({ staged: false })

    if (!json) {
      throw Error(`Cannot create or overwrite ${this.nowJsonName} because now.json is not present`)
    }

    if (!this.options.stage && !this.options.project) {
      throw Error(`Provide --stage or now --json to use overwrite option`)
    }

    if (!json.env) {
      json = { ...json, env: {} }
    }

    Object.keys(this.envs).forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      json!.env![name] = '@' + this.formatName(name)
    })

    this.writeNowJson(json)

    this.log(`Overwriten ${this.nowJsonName} with now.json and envs`)
  }

  private dedupeSecrets(secrets: NowSecret[], { staged = true }) {
    return secrets.filter(({ name }) =>
      staged
        ? name.substr(0, this.prefix.length) === this.prefix
        : name.substr(0, this.projectName.length) === this.projectName,
    )
  }

  private generateTypings() {
    let res = ''
    res += `declare namespace NodeJS {\n`
    res += `  interface ProcessEnv {\n`

    Object.keys(this.envs).forEach(fieldname => {
      res += `    ${fieldname}: string\n`
    })

    res += `  }\n`
    res += `}\n`

    return res
  }

  /** CONFIG */

  private getNowJsonName() {
    if (this.options.project) {
      return basename(this.options.project)
    }

    if (!this.options.stage) {
      return 'now.json'
    }

    return `now.${this.options.stage}.json`
  }

  private getNowJsonPath(nowJsonName: string) {
    if (this.options.project) {
      return this.options.project
    }

    return join(process.cwd(), nowJsonName)
  }

  private getPrefix(projectName: string) {
    let res = projectName + '-'

    if (this.options.stage) {
      res += this.options.stage + '-'
    }

    return res.toLowerCase().replace('_', '-')
  }

  private getProjectName() {
    if (this.options.name) return this.options.name

    const nowJson = this.readNowJson({ staged: true }) || this.readNowJson({ staged: false })
    const pkgJson = this.readPkgJson()

    if (!(nowJson && nowJson.name) && !(pkgJson && pkgJson.name)) {
      throw Error(`Could not determine project name from args, package.json or now.json`)
    }

    return ((nowJson && nowJson.name) || (pkgJson && pkgJson.name)) as string
  }

  private getToken(envs: Envs) {
    if (this.options.token) {
      return this.options.token
    }

    if (process.env.NOW_TOKEN) {
      return process.env.NOW_TOKEN
    }

    if (envs.NOW_TOKEN) {
      return envs.NOW_TOKEN
    }

    throw Error(`Now API token is missing.`)
  }

  /** READ-WRITE */

  private readPkgJson(): PackageJson | undefined {
    try {
      const file = readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
      return JSON.parse(file)
    } catch {
      return undefined
    }
  }

  private readNowJson({ staged = true }): NowJson | undefined {
    const path = staged ? this.nowJsonPath : join(process.cwd(), 'now.json')

    try {
      return JSON.parse(readFileSync(path, 'utf-8'))
    } catch {
      return undefined
    }
  }

  private writeNowJson(data: unknown) {
    return writeFileSync(this.nowJsonPath, JSON.stringify(data, null, 2))
  }

  private readEnvs() {
    const path = this.options.env || (this.options.stage ? `.env.${this.options.stage}` : '.env')

    const { parsed, error } = dotenv.config({ path })

    if (error) throw error
    if (!parsed || (isObject(parsed) && Object.keys(parsed).length === 0)) throw Error(`Could not find envs in ${path}`)

    this.log(`Envs read from ${path}`)

    return parsed
  }

  /** FORMAT */

  private formatName(name: string) {
    return this.prefix + name.toLowerCase().replace('_', '-')
  }

  private formatErr(res: Response, msg?: string) {
    return `${msg} (${res.status}: ${res.statusText})`
  }

  /** LOG */

  private log(...msgs: unknown[]) {
    if (this.options.verbose) console.log(...msgs)
  }
}
