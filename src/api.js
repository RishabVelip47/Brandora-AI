
const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  let data

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

export function getBrands() {
  return request('/brands')
}

export function createBrand(brand) {
  return request('/brands', {
    method: 'POST',
    body: JSON.stringify(brand),
  })
}

export function updateBrand(id, brand) {
  return request(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(brand),
  })
}

export function deleteBrand(id) {
  return request(`/brands/${id}`, {
    method: 'DELETE',
  })
}
