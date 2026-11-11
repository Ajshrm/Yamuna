const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiRequest(path, { token, body, headers, ...options } = {}) {
  const requestHeaders = { ...headers }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return null
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`The API returned an invalid response (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }

  return data
}
