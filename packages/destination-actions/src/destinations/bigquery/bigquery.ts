import type { Settings } from './generated-types'
import { BigQuery, InsertRowsResponse } from '@google-cloud/bigquery'

function getTableNameForEvent(eventName: string) {
  return eventName.replace(/[^a-zA-Z0-9_]/g, '_')
}

export interface BQ {
  createTable(tableName: string, schema: Record<string, unknown>[]): Promise<unknown>
  insert(name: string, payload: Record<string, unknown>): Promise<InsertRowsResponse>
}

export default class MyBigquery implements BQ {
  settings: Settings
  client: BigQuery
  constructor(settings: Settings) {
    this.settings = settings
    if (settings.keyFile !== undefined) {
      this.client = new BigQuery({
        projectId: settings.projectId,
        keyFile: settings.keyFile
      })
    } else if (settings.keyData !== undefined) {
      const keyContents = JSON.parse(settings.keyData)
      this.client = new BigQuery({
        projectId: settings.projectId,
        credentials: keyContents
      })
    }
    this.client = new BigQuery({
      projectId: settings.projectId
    })
  }

  async createTable(tableName: string, schema: unknown): Promise<unknown> {
    const dataset = this.client.dataset(this.settings.dataset)
    const table = dataset.table(tableName)
    const options = {
      schema: schema,
      timePartitioning: {
        field: 'timestamp'
      }
    }
    return table.create(options)
  }

  async insert(name: string, payload: Record<string, unknown>): Promise<InsertRowsResponse> {
    // convert objects to json strings
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'object') {
        payload[key] = JSON.stringify(payload[key])
      }
    })
    const tableName = getTableNameForEvent(name)
    // check if dataset.tableName exists, if it doesnt, log an error. dbt should have created one.
    return this.client.dataset(this.settings.dataset).table(tableName).insert(payload)
  }
}
