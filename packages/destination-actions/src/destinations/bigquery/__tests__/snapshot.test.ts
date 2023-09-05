import { createTestEvent, createTestIntegration, defaultValues } from '@segment/actions-core'
import { generateTestData } from '../../../lib/test-data'
import destination from '../index'

const mockInsert = jest.fn().mockReturnValue(Promise.resolve())
jest.mock('../bigquery', () => {
  return jest.fn().mockImplementation(() => {
    return { insert: mockInsert }
  })
})

beforeEach(() => {
  mockInsert.mockClear()
})

const testDestination = createTestIntegration(destination)
const destinationSlug = 'actions-bigquery'

describe(`Testing snapshot for ${destinationSlug} destination:`, () => {
  for (const actionSlug in destination.actions) {
    it(`${actionSlug} action - required fields`, async () => {
      const seedName = `${destinationSlug}#${actionSlug}`
      const action = destination.actions[actionSlug]
      const [eventData, settingsData] = generateTestData(seedName, destination, action, true)

      const event = createTestEvent({
        properties: eventData
      })

      await testDestination.testAction(actionSlug, {
        event: event,
        mapping: defaultValues(action.fields),
        settings: settingsData,
        auth: undefined
      })

      expect(mockInsert).toHaveBeenCalledTimes(1)
      expect(mockInsert.mock.calls[0]).toMatchSnapshot()
    })

    it(`${actionSlug} action - all fields`, async () => {
      const seedName = `${destinationSlug}#${actionSlug}`
      const action = destination.actions[actionSlug]
      const [eventData, settingsData] = generateTestData(seedName, destination, action, false)

      const event = createTestEvent({
        properties: eventData
      })

      await testDestination.testAction(actionSlug, {
        event: event,
        mapping: defaultValues(action.fields),
        settings: settingsData,
        auth: undefined
      })
      expect(mockInsert).toHaveBeenCalledTimes(1)
      expect(mockInsert.mock.calls[0]).toMatchSnapshot()
    })
  }
})
