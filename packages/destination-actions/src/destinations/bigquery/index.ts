import type { Settings } from './generated-types'
import { defaultValues } from '@segment/actions-core'
import type { DestinationDefinition, InputField } from '@segment/actions-core'

import insert from './insert'
import MyBigquery from './bigquery'

function getBigqueryFieldType(field: InputField) {
  switch (field.type) {
    case 'string':
    case 'text':
      return 'STRING'
    case 'number':
      return 'FLOAT'
    case 'integer':
      return 'INTEGER'
    case 'datetime':
      return 'TIMESTAMP'
    case 'boolean':
      return 'BOOLEAN'
    case 'object':
      return 'JSON'
    default:
      return 'STRING'
  }
}

/** used in the quick setup */
const presets: DestinationDefinition['presets'] = [
  {
    name: 'Track Calls',
    subscribe: 'type = "track" or type = "screen" or type = "page"',
    partnerAction: 'insert',
    mapping: defaultValues(insert.fields),
    type: 'automatic'
  },
  {
    name: 'Identify Calls',
    subscribe: 'type = "identify" or type = "group"',
    partnerAction: 'insert',
    mapping: defaultValues(insert.fields),
    type: 'automatic'
  }
]

const destination: DestinationDefinition<Settings> = {
  name: 'Bigquery',
  slug: 'actions-bigquery',
  mode: 'cloud',

  authentication: {
    scheme: 'custom',
    fields: {
      projectId: {
        label: 'Project ID',
        description: 'Your Google Cloud project ID',
        type: 'string',
        required: true
      },
      dataset: {
        label: 'Dataset',
        description: 'The dataset to insert events into',
        type: 'string',
        required: true
      },
      keyFile: {
        label: 'Key File',
        description: 'Path to your Google Cloud key file',
        type: 'string',
        required: false
      },
      keyData: {
        label: 'Key Data',
        description: 'The contents of your Google Cloud key file',
        type: 'string',
        required: false
      }
    },
    testAuthentication: async (_, { settings }) => {
      // Return a request that tests/validates the user's credentials.
      // If you do not have a way to validate the authentication fields safely,
      // you can remove the `testAuthentication` function, though discouraged.
      // create the required fields for the request
      const client = new MyBigquery(settings)
      // get schema from insert action's fields.
      const tableSchema = Object.entries(insert.fields).map(([key, value]) => {
        const schema: Record<string, unknown> = {
          name: key,
          description: value.description,
          type: getBigqueryFieldType(value)
        }
        if (value.multiple) {
          schema.mode = 'REPEATED'
        } else if (value.required) {
          schema.mode = 'REQUIRED'
        }
        return schema
      })
      // get existing tables.
      const [tables] = await client.client.dataset(settings.dataset).getTables()
      const tableNames = tables.map((table) => table.id)
      // create tables if they dont exist.
      const tablesToCreate = ['tracks', 'identifies', 'groups', 'aliases', 'pages', 'screens'].filter(
        (tableName) => !tableNames.includes(tableName)
      )
      const promises = tablesToCreate.map((tableName) => client.createTable(tableName, tableSchema))
      await Promise.all(promises)
    }
  },
  presets,
  actions: {
    insert
  }
}

export default destination
