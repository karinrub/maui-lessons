/**
 * Send a Formspree-compatible booking request.
 *
 * The endpoint is injected at build time rather than embedded in source, so
 * the static GitHub Pages app can be connected to a client-owned Formspree
 * form without exposing any private credentials.
 */
export async function submitBookingRequest(endpoint, formData, options = {}) {
  if (!endpoint?.trim()) {
    throw new Error('Booking delivery is not configured.')
  }

  const fetchImpl = options.fetchImpl ?? fetch
  let response

  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The request took too long. Please try again.')
    }
    throw new Error('Unable to send your request. Check your connection and try again.')
  }

  if (response.ok) {
    return
  }

  let message = 'Unable to send your request. Please try again.'
  try {
    const body = await response.json()
    if (Array.isArray(body?.errors) && typeof body.errors[0]?.message === 'string') {
      message = body.errors[0].message
    }
  } catch {
    // Non-JSON error bodies are normal for generic form endpoints.
  }

  throw new Error(message)
}
