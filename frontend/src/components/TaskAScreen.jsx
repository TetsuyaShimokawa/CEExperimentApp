import { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'

function fmt_p(p) {
  const pct = p * 100
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

export default function TaskAScreen({
  trial,
  currentNum,
  totalNum,
  isReliability,
  onAnswer,
}) {
  const [ceValue, setCeValue] = useState('')

  // Reset input on new trial
  useEffect(() => {
    setCeValue('')
  }, [trial.trial])

  const ceNum = parseFloat(ceValue)
  const ceValid = ceValue !== '' && !isNaN(ceNum) && ceNum >= 0 && ceNum <= trial.x

  async function handleNext() {
    if (!ceValid) return
    await onAnswer(ceNum)
  }

  return (
    <div className="screen">
      <ProgressBar
        current={currentNum}
        total={totalNum}
        label={isReliability ? '信頼性確認' : '課題A'}
      />

      {isReliability ? (
        <div className="reliability-note">
          もう少しで終わりです。先ほどと同じ形式の問題です。引き続き正直な評価を答えてください。
        </div>
      ) : null}

      <h2>
        {isReliability
          ? `信頼性確認（${currentNum}/${totalNum}）`
          : `課題A（${currentNum}/${totalNum}）`}
      </h2>

      <p>以下のくじの確実性等価（CE）を入力してください。<br />
        「このくじと同じくらい価値があると感じる確実な金額」を答えてください。
      </p>

      <div className="lottery-box">
        <div className="lottery-row win">
          <span className="prob">{fmt_p(trial.p)}</span> で{' '}
          <span className="amount">{trial.x}円</span> が当たる
        </div>
        <div className="lottery-row lose">
          <span className="prob">{fmt_p(1 - trial.p)}</span> で{' '}
          <span className="amount">0円</span>（ハズレ）
        </div>
      </div>

      <div className="ce-input-group">
        <label>あなたの確実性等価：</label>
        <div className="ce-input-row">
          <input
            type="number"
            min={0}
            max={trial.x}
            value={ceValue}
            onChange={e => setCeValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && ceValid) handleNext() }}
            placeholder="0"
            autoFocus
          />
          <span>円</span>
        </div>
        <p className="hint">有効範囲：0円 〜 {trial.x}円（くじの最高額）</p>
        {ceValue !== '' && !ceValid && (
          <p className="error">0円以上{trial.x}円以下の数値を入力してください</p>
        )}
      </div>

      <button className="btn-primary" disabled={!ceValid} onClick={handleNext}>
        次へ
      </button>
    </div>
  )
}
