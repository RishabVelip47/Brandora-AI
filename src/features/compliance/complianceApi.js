
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://brandora-ai.onrender.com/api')

export async function fetchBrands() {
  const response = await fetch(`${API_BASE}/brands`);
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not load brands");
  }

  return data.brands;
}

export async function checkCompliance(brandId, content) {
  const response = await fetch(`${API_BASE}/compliance/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ brandId, content }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Compliance check failed");
  }

  return data.report;
}

export async function submitForApproval({
  brandId,
  content,
  report,
  title,
}) {
  const response = await fetch(
    `${API_URL}/approvals`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brandId,
        content,
        title,
        report,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Failed to submit content for approval'
    )
  }

  return data.approval
}
