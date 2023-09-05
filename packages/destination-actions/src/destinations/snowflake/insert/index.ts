import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import MySnowFlake from '../snowflake'

function getTableName(eventType: string): string {
  if (eventType === 'identify') {
    return 'identifies'
  }
  return `${eventType}s`
}

const action: ActionDefinition<Settings, Payload> = {
  title: 'Insert',
  description: '',
  fields: {
    _id: {
      label: '_id',
      default: {
        '@path': '$.messageId'
      },
      type: 'string',
      description: 'The unique ID of the track call itself.'
    },
    anonymous_id: {
      label: 'anonymous_id',
      default: {
        '@path': '$.anonymousId'
      },
      type: 'string',
      description: 'The anonymous ID of the user.'
    },
    user_id: {
      label: 'user_id',
      default: {
        '@path': '$.userId'
      },
      type: 'string',
      description: 'The User ID.'
    },

    context_ip: {
      label: 'context_ip',
      default: {
        '@path': '$.context.ip'
      },
      type: 'string',
      description: 'The IP address of the client. Non-user-related context fields sent with each track call.'
    },
    context_library_name: {
      label: 'context_library_name',
      default: {
        '@path': '$.context.library.name'
      },
      type: 'string',
      description: 'The Logging library name. Non-user-related context fields sent with each track call.'
    },
    context_library_version: {
      label: 'context_library_version',
      default: {
        '@path': '$.context.library.version'
      },
      type: 'string',
      description: 'The Logging library version. Non-user-related context fields sent with each track call.'
    },
    context_page_path: {
      label: 'context_page_path',
      default: {
        '@path': '$.context.page.path'
      },
      type: 'string',
      description: 'The path of the page on which the event was logged.'
    },
    context_page_title: {
      label: 'context_page_title',
      default: {
        '@path': '$.context.page.title'
      },
      type: 'string',
      description: 'The title of the page on which the event was logged.'
    },
    context_page_url: {
      label: 'context_page_url',
      default: {
        '@path': '$.context.page.url'
      },
      type: 'string',
      description: 'The full url of the page on which the event was logged.'
    },
    context_locale: {
      label: 'context_locale',
      default: {
        '@path': '$.context.locale'
      },
      type: 'string',
      description: 'The browsers locale used when the event was logged.'
    },
    context_user_agent: {
      label: 'context_user_agent',
      default: {
        '@path': '$.context.userAgent'
      },
      type: 'string',
      description: 'The browsers user-agent string.'
    },

    event: {
      label: 'event',
      default: {
        '@path': '$.event'
      },
      type: 'string',
      description: 'The slug of the event name, so you can join the tracks table.'
    },
    name: {
      label: 'name',
      default: {
        '@path': '$.name'
      },
      type: 'string',
      description: 'The event name.'
    },
    received_at: {
      label: 'received_at',
      default: {
        '@path': '$.receivedAt'
      },
      type: 'datetime',
      description: 'When Segment received the track call.'
    },
    sent_at: {
      label: 'sent_at',
      default: {
        '@path': '$.sentAt'
      },
      type: 'datetime',
      description: 'When a user triggered the track call. This timestamp can also be affected by device clock skew'
    },
    timestamp: {
      label: 'timestamp',
      default: {
        '@path': '$.timestamp'
      },
      type: 'datetime',
      description: 'The UTC-converted timestamp which is set by the Segment library'
    },

    properties: {
      label: 'properties',
      default: {
        '@path': '$.properties'
      },
      type: 'object',
      additionalProperties: true,
      defaultObjectUI: 'keyvalue',
      description: 'JSON representation of the properties for the event.'
    },

    context: {
      label: 'context',
      default: {
        '@path': '$.context'
      },
      type: 'object',
      additionalProperties: true,
      defaultObjectUI: 'keyvalue',
      description: 'JSON representation of the context'
    }
  },
  perform: async (_, data) => {
    const { settings, payload } = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = (data as any).rawData
    await new MySnowFlake(settings).insert(getTableName(rawData.type), payload as unknown as Record<string, unknown>)
  }
}

export default action
