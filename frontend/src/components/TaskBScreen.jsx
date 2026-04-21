import { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'

function fmt_p(p) {
  const pct = p * 100
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

/**
 * switchPoint: インデックス（最初にBが選ばれた行）または null
 * holes: Set<number> — Bゾーン内で手動でAに変えた行のインデックス集合
 *
 * 表示ルール:
 *   i < switchPoint          → A（手動）
 *   i >= switchPoint & hole  → A（手動オーバーライド）
 *   i === switchPoint        → B（手動・最初のB）
 *   i > switchPoint & !hole  → B（自動入力・グレーアウト）
 */
function computeRows(switchPoint, holes, n) {
  return Array.from({ length: n }, (_, i) => {
    if (switchPoint === null || i < switchPoint) {
      return { choice: 'A', auto: false }
    }
    if (holes.has(i)) {
      return { choice: 'A', auto: false }
    }
    if (i === switchPoint) {
      return { choice: 'B', auto: false }
    }
    return { choice: 'B', auto: true }
  })
}

function countTransitions(choices) {
  let t = 0
  for (let i = 1; i < choices.length; i++) {
    if (choices[i] !== choices[i - 1]) t++
  }
  return t
}

export default function TaskBScreen({ question, currentNum, totalNum, onAnswer }) {
  const N = question.price_list.length // 19

  const [switchPoint, setSwitchPoint] = useState(null)
  const [holes, setHoles] = useState(new Set())
  const [warned, setWarned] = useState(false)

  useEffect(() => {
    setSwitchPoint(null)
    setHoles(new Set())
    setWarned(false)
  }, [question.question])

  const displayRows = computeRows(switchPoint, holes, N)
  const choices = displayRows.map(r => r.choice)
  const hasMultipleSwitch = countTransitions(choices) > 1

  function handleClickB(i) {
    // i以下を全部Bに（switchPointを左に移動し、i以降のholesをクリア）
    setSwitchPoint(prev => (prev === null ? i : Math.min(prev, i)))
    setHoles(prev => {
      const next = new Set(prev)
      for (const h of [...next]) {
        if (h >= i) next.delete(h)
      }
      return next
    })
  }

  function handleClickA(i) {
    // Bゾーン外（または既にA）なら何もしない
    if (switchPoint === null || i < switchPoint) return

    let newHoles = new Set([...holes, i])
    let newSP = switchPoint

    // switchPoint自身がholeになった場合は次の非hole行へ進める
    while (newSP !== null && newHoles.has(newSP)) {
      newSP = newSP + 1 < N ? newSP + 1 : null
    }

    // 新しいswitchPointより前のholesは不要なので削除
    if (newSP !== null) {
      for (const h of [...newHoles]) {
        if (h < newSP) newHoles.delete(h)
      }
    } else {
      newHoles = new Set()
    }

    setSwitchPoint(newSP)
    setHoles(newHoles)
  }

  function handleNext() {
    if (hasMultipleSwitch && !warned) {
      setWarned(true)
      return
    }
    onAnswer(choices)
  }

  return (
    <div className="screen">
      <ProgressBar current={currentNum} total={totalNum} label="課題B" />
      <h2>課題B（{currentNum}/{totalNum}）</h2>

      <p>
        以下のくじについて、各行でどちらを好むか選んでください。<br />
        くじ（A）を選ぶ → 確実額（B）を選ぶ、の<strong>切り替えは1回のみ</strong>推奨です。
      </p>

      <div className="lottery-summary">
        くじ：確率 <strong>{fmt_p(question.p)}</strong> で{' '}
        <strong>{question.x}円</strong>、
        確率 <strong>{fmt_p(1 - question.p)}</strong> で 0円
      </div>

      {hasMultipleSwitch && warned && (
        <div className="warning-box">
          ⚠️ 通常、上の行でBを選んだら下の行でもBを選びます。回答を確認してください。<br />
          そのまま進むこともできます。
        </div>
      )}

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
            {question.price_list.map((amount, i) => {
              const { choice, auto } = displayRows[i]
              const rowClass = choice === 'A' ? 'row-a' : auto ? 'row-b-auto' : 'row-b'
              return (
                <tr key={i} className={rowClass}>
                  <td>{i + 1}</td>
                  <td>上記のくじ</td>
                  <td>確実に {amount}円</td>
                  <td className="choice-cell">
                    <button
                      className={`choice-btn ${choice === 'A' ? 'active-a' : ''}`}
                      onClick={() => handleClickA(i)}
                    >
                      A
                    </button>
                    <button
                      className={`choice-btn ${
                        choice === 'B' ? (auto ? 'active-b-auto' : 'active-b') : ''
                      }`}
                      onClick={() => handleClickB(i)}
                    >
                      B
                    </button>
                    {auto && (
                      <span className="auto-label">自動</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="hint" style={{ marginTop: '0.5rem' }}>
        ※ 「自動」と表示された行はBが自動入力されています。変更したい場合はAボタンを押してください。
      </p>

      <button className="btn-primary" onClick={handleNext}>
        {hasMultipleSwitch && !warned ? '回答を確認（複数スイッチあり）' : '次の問題へ'}
      </button>
    </div>
  )
}
