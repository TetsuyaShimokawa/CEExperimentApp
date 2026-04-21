const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const BASE = `${BACKEND_URL}/api/ce`

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function startSession(studentId, name) {
  return post('/session/start', { student_id: studentId, name })
}

export async function saveTaskA(data) {
  return post('/results/task_a', data)
}

export async function saveTaskB(data) {
  return post('/results/task_b', data)
}

export async function computeReward(sessionId, studentId) {
  return post('/results/reward', { session_id: sessionId, student_id: studentId })
}

export function csvDownloadUrl(studentId) {
  return `${BASE}/results/${encodeURIComponent(studentId)}/csv`
}
