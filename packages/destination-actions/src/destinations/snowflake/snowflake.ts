import type { Settings } from './generated-types'
import { Connection, createConnection } from 'snowflake-sdk'

function getTableNameForEvent(eventName: string) {
  return eventName.replace(/[^a-zA-Z0-9_]/g, '_')
}

export interface SnowFlake {
  createTable(tableName: string, schema: Record<string, string>[]): Promise<unknown>
  insert(name: string, payload: Record<string, unknown>): Promise<unknown>
}

export default class MySnowFlake implements SnowFlake {
  settings: Settings
  connection: Connection
  constructor(settings: Settings) {
    this.settings = settings
    this.connection = createConnection({
      account: settings.account,
      username: settings.username,
      password: settings.password,
      application: settings.application
    })
  }

  async __executeSQL(sqlText: string, binds: (string | number)[] | undefined = undefined): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.connection.connect(function (err, conn) {
        if (err) {
          console.error('Unable to connect: ' + err.message)
          reject(err)
        }
        console.log('Connected to Snowflake.')
        conn.execute({
          sqlText,
          binds,
          complete: function (err, stmt) {
            if (err) {
              console.error('Failed to execute statement due to the following error: ' + err.message)
              reject(err)
            } else {
              console.log('Successfully executed statement: ' + stmt.getSqlText())
              resolve(true)
            }
          }
        })
      })
    })
  }

  async createTable(tableName: string, schema: Record<string, string>[]): Promise<unknown> {
    const tableSchema = schema.map((column) => `${column.key} ${column.type}`).join(', ')
    return this.__executeSQL(`CREATE TABLE IF NOT EXISTS ${tableName} (${tableSchema})`)
  }

  async insert(name: string, payload: Record<string, unknown>): Promise<unknown> {
    // convert objects to json strings
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'object') {
        payload[key] = JSON.stringify(payload[key])
      }
    })
    const tableName = getTableNameForEvent(name)
    const fields = Object.keys(payload)
    const fieldStr = fields.join(', ')
    const valueStr = fields.map((_) => '?').join(', ')
    const values = fields.map((f) => payload[f] as string | number)
    return this.__executeSQL(`INSERT INTO ${tableName}(${fieldStr}) VALUES (${valueStr})`, values)
  }
}
