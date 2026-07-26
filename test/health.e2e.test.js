import request from 'supertest'

import app from '@src/app'

describe('GET /api/v1/health', () => {
  it('returns the service health payload', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toEqual(
      expect.objectContaining({
        service: 'project-management-backend',
        status: 'ok'
      })
    )
  })
})
