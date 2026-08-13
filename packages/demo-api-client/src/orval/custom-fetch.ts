import type { $Fetch } from 'ofetch'

let apiFetch: $Fetch | undefined

export function configureClient(fetch: $Fetch) {
  apiFetch = fetch
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  if (!apiFetch) {
    throw new Error('API client is not configured. Call configureApi() first.')
  }
  return apiFetch<T>(url, options)
}
