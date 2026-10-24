
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://brandora-ai.onrender.com/api')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (error) {
    throw new Error(
      `Cannot connect to Brandora AI backend. Check the API URL and backend status. ${error.message}`
    )
  }

  let data = {}

  try {
    data = await response.json()
  } catch {
    // The server may return an empty or non-JSON response.
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}

export function getBrands() {
  return request('/brands')
}

export function getBrand(id) {
  return request(`/brands/${encodeURIComponent(id)}`)
}

export function createBrand(brand) {
  return request('/brands', {
    method: 'POST',
    body: JSON.stringify(brand),
  })
}

export function updateBrand(id, brand) {
  return request(`/brands/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(brand),
  })
}

export function deleteBrand(id) {
  return request(`/brands/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
