import { useState } from 'react'

const PRACTICE_A = { p: 0.5, x: 200 }
const PRACTICE_B = { p: 0.25, x: 800, price_list: [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760] }

function fmt_p(p) {
  const pct = p * 100
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

export default function PracticeScreen({ onNext }) {
  const [ceValue, setCeValue] = useState('')
  const [choices, setChoices] = useState(Array(19).fill('A'))
  const [step, setStep] = useState('a') // 'a' or 'b'

  function toggleChoice(idx) {
    setChoices(prev => {
      const next = [...prev]
      next[idx] = next[idx] === 'A' ? 'B' : 'A'
      return next
    })
  }

  const ceNum = parseFloat(ceValue)
  const ceValid = ceValue !== '' && !isNaN(ceNum) && ceNum >= 0 && ceNum <= PRACTICE_A.x

  if (step === 'a') {
    return (
      <div className="screen">
        <div className="practice-badge">これは練習問題です</div>
        <h2>課題A 練習</h2>
        <p>以下のくじの確実性等価（CE）を入力してください。</p>

        <div className="lottery-box">
          <div className="lottery-row win">
            <span className="prob">{fmt_p(PRACTICE_A.p)}</span> で{' '}
            <span className="amount">{PRACTICE_A.x}円</span> が当たる
          </div>
          <div className="lottery-row lose">
            <span className="prob">{fmt_p(1 - PRACTICE_A.p)}</span> で{' '}
            <span className="amount">0円</span>（ハズレ）
          </div>
        </div>

        <div className="ce-input-group">
          <label>あなたの確実性等価：</label>
          <div className="ce-input-row">
            <input
              type="number"
              min={0}
              max={PRACTICE_A.x}
              value={ceValue}
              onChange={e => setCeValue(e.target.value)}
              placeholder="0"
            />
            <span>円</span>
          </div>
          <p className="hint">有効範囲：0円 〜 {PRACTICE_A.x}円</p>
          {ceValue !== '' && !ceValid && (
            <p className="error">0円以上{PRACTICE_A.x}円以下の数値を入力してください</p>
          )}
        </div>

        <button
          className="btn-primary"
          disabled={!ceValid}
          onClick={() => setStep('b')}
        >
          次の練習へ
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="practice-badge">これは練習問題です</div>
      <h2>課題B 練習</h2>
      <p>
        以下のくじについて、各行でどちらを好むか選んでください。<br />
        スイッチは1回だけにしてください。
      </p>

      <div className="lottery-summary">
        くじ：確率 {fmt_p(PRACTICE_B.p)} で {PRACTICE_B.x}円、
        確率 {fmt_p(1 - PRACTICE_B.p)} で 0円
      </div>

      <div className="price-list-table-wrap">
        <table className="price-list-table">
          <thead>
            <tr>
              <th>行</th>
              <th>選択肢A（くじ）</th>
              <th>選択肢B（確実額）</th>
              <th>選択</th>
            </tr>
          </thead>
          <tbody>
            {PRACTICE_B.price_list.map((amount, i) => (
              <tr key={i} className={choices[i] === 'B' ? 'row-b' : 'row-a'}>
                <td>{i + 1}</td>
                <td>上記のくじ</td>
                <td>確実に {amount}円</td>
                <td>
                  <button
                    className={`choice-btn ${choices[i] === 'A' ? 'active-a' : ''}`}
                    onClick={() => {
                      const next = [...choices]
                      next[i] = 'A'
                      setChoices(next)
                    }}
                  >A</button>
                  {' '}
                  <button
                    className={`choice-btn ${choices[i] === 'B' ? 'active-b' : ''}`}
                    onClick={() => {
                      const next = [...choices]
                      next[i] = 'B'
                      setChoices(next)
                    }}
                  >B</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={onNext}>
        本番を始める
      </button>
    </div>
  )
}
