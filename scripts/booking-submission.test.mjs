import assert from 'node:assert/strict'
import test from 'node:test'
import { submitBookingRequest } from '../src/utils/submitBookingRequest.js'

const formData = new FormData()
formData.set('name', 'Maui Visitor')
formData.set('email', 'visitor@example.com')

test('posts booking data as Formspree-compatible JSON', async () => {
  let request
  await submitBookingRequest('https://formspree.io/f/example', formData, {
    fetchImpl: async (url, init) => {
      request = { url, init }
      return new Response('{}', { status: 200 })
    },
  })

  assert.equal(request.url, 'https://formspree.io/f/example')
  assert.equal(request.init.method, 'POST')
  assert.equal(request.init.headers.Accept, 'application/json')
  assert.equal(request.init.body, formData)
})

test('surfaces delivery errors so the UI can offer a retry', async () => {
  await assert.rejects(
    () =>
      submitBookingRequest('https://formspree.io/f/example', formData, {
        fetchImpl: async () => new Response(JSON.stringify({ errors: [{ message: 'Mailbox unavailable' }] }), { status: 422 }),
      }),
    { message: 'Mailbox unavailable' },
  )
})

test('fails safely when no endpoint is configured', async () => {
  await assert.rejects(() => submitBookingRequest('', formData), { message: 'Booking delivery is not configured.' })
})
