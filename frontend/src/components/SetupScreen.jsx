import { useState } from 'react'

export default function SetupScreen({ onStart }) {
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = studentId.trim() && name.trim() && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onStart(studentId.trim(), name.trim())
    } catch (err) {
      setError('セッション開始に失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <h1>確率荷重関数推定実験</h1>
      <form className="setup-form" onSubmit={handleSubmit}>
        <label>
          学籍番号
          <input
            type="text"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            placeholder="例：2024001"
            autoFocus
          />
        </label>
        <label>
          氏名
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：山田 太郎"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          {loading ? '準備中...' : '実験を始める'}
        </button>
      </form>
    </div>
  )
}
