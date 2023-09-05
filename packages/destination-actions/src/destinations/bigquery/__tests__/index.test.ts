import { createTestIntegration } from '@segment/actions-core'
import Definition from '../index'

const mockCreateTable = jest.fn().mockReturnValue(Promise.resolve())
jest.mock('../bigquery', () => {
  return jest.fn().mockImplementation(() => {
    return { createTable: mockCreateTable }
  })
})

beforeEach(() => {
  mockCreateTable.mockClear()
})

const testDestination = createTestIntegration(Definition)

describe('Bigquery', () => {
  describe('testAuthentication', () => {
    it('should validate authentication inputs', async () => {
      // This should match your authentication.fields
      const authData = {
        projectId: 'projectId',
        dataset: 'dataset',
        keyFile: 'keyFile'
      }
      await expect(testDestination.testAuthentication(authData)).resolves.not.toThrowError()
      expect(mockCreateTable).toHaveBeenCalledTimes(6)
    })
  })
})
