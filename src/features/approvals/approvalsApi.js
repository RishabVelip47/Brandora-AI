const API_URL = `${
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://brandora-ai.onrender.com/api')
}/approvals`
export async function fetchApprovals() {
  const response = await fetch(API_URL)
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to load approvals')
  }

  return data.approvals
}

export async function decideApproval(id, status, reviewerComment) {
  const response = await fetch(`${API_URL}/${id}/decision`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, reviewerComment }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update approval')
  }

  return data.approval
}