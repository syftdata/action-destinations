import type { Settings } from './generated-types'
import { defaultValues } from '@segment/actions-core'
import type { DestinationDefinition, InputField } from '@segment/actions-core'

import insert from './insert'
import MySnowFlake from './snowflake'

function getSnowflakeFieldType(field: InputField) {
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
      return 'VARIANT'
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
  name: 'Snowflake',
  slug: 'actions-snowflake',
  mode: 'cloud',

  /**
   *       account: 'account',
      username: 'username',
      password: 'password',
      application: 'application'

   */
  authentication: {
    scheme: 'custom',
    fields: {
      account: {
        label: 'Account',
        description: 'Your Snowflake Account',
        type: 'string',
        required: true
      },
      username: {
        label: 'Username',
        description: 'Your Snowflake Username',
        type: 'string',
        required: true
      },
      password: {
        label: 'Password',
        description: 'Your Snowflake Password. This is a secret field.',
        type: 'string',
        required: true
      },
      application: {
        label: 'Application',
        description: 'Your Snowflake Application Name',
        type: 'string',
        required: true
      }
    },
    testAuthentication: async (_, { settings }) => {
      // Return a request that tests/validates the user's credentials.
      // If you do not have a way to validate the authentication fields safely,
      // you can remove the `testAuthentication` function, though discouraged.
      // create the required fields for the request
      const client = new MySnowFlake(settings)
      // get schema from insert action's fields.
      const tableSchema = Object.entries(insert.fields).map(([key, value]) => {
        const schema: Record<string, string> = {
          name: key,
          type: getSnowflakeFieldType(value)
        }
        if (value.multiple) {
          schema.mode = 'REPEATED'
        } else if (value.required) {
          schema.mode = 'REQUIRED'
        }
        return schema
      })
      const promises = [
        client.createTable('tracks', tableSchema),
        client.createTable('identifies', tableSchema),
        client.createTable('groups', tableSchema),
        client.createTable('aliases', tableSchema),
        client.createTable('pages', tableSchema),
        client.createTable('screens', tableSchema)
      ]
      await Promise.all(promises)
    }
  },
  presets,
  actions: {
    insert
  }
}

export default destination
