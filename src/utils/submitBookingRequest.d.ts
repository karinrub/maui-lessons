export type BookingRequestOptions = {
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

export function submitBookingRequest(
  endpoint: string,
  formData: FormData,
  options?: BookingRequestOptions,
): Promise<void>
