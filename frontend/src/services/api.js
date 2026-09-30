const API_BASE = '/api';

export async function fetchLatestReport() {
  const res = await fetch(`${API_BASE}/report/latest`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch latest report');
  }
  return res.json();
}

export async function runAnalysis() {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis execution failed');
  }
  return res.json();
}

export async function generateSyntheticData(days = 365) {
  const res = await fetch(`${API_BASE}/generate-synthetic?days=${days}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate synthetic data');
  }
  return res.json();
}

export async function uploadSalesCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw errorData;
  }
  return res.json();
}

export async function fetchShowcases() {
  const res = await fetch(`${API_BASE}/showcases`);
  if (!res.ok) throw new Error('Failed to load showcases');
  return res.json();
}

export async function explainSku(sku, question = null) {
  const url = question
    ? `${API_BASE}/explain/${encodeURIComponent(sku)}?question=${encodeURIComponent(question)}`
    : `${API_BASE}/explain/${encodeURIComponent(sku)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to get explanation');
  }
  return res.json();
}

export async function sendChatMessage(message, sku = null) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sku }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to get advisor response');
  }
  return res.json();
}
