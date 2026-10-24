const API_URL = 'http://localhost:5000/api/approvals'

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