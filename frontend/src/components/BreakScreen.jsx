import { useState, useEffect } from 'react'

const BREAK_SECONDS = 120

export default function BreakScreen({ onNext }) {
  const [remaining, setRemaining] = useState(BREAK_SECONDS)

  useEffect(() => {
    if (remaining <= 0) return
    const id = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <div className="screen">
      <h1>休憩</h1>
      <p className="break-msg">課題Aが終了しました。お疲れ様でした。</p>
      <p>2分間休憩してから課題Bを始めてください。</p>

      {remaining > 0 ? (
        <>
          <div className="timer">{timeStr}</div>
          <p className="hint">タイマーが終了するまでお待ちください</p>
        </>
      ) : (
        <p className="timer-done">休憩終了！</p>
      )}

      <p className="break-info">
        課題Bでは、くじと確実な金額のどちらを好むか選んでいただきます。
      </p>

      <button
        className="btn-primary"
        disabled={remaining > 0}
        onClick={onNext}
      >
        課題Bへ
      </button>
    </div>
  )
}
