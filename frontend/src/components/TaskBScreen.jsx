import { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'

function fmt_p(p) {
  const pct = p * 100
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

function detectMultipleSwitch(choices) {
  let transitions = 0
  for (let i = 1; i < choices.length; i++) {
    if (choices[i] !== choices[i - 1]) transitions++
  }
  return transitions > 1
}

export default function TaskBScreen({ question, currentNum, totalNum, onAnswer }) {
  const [choices, setChoices] = useState(Array(question.price_list.length).fill('A'))
  const [warned, setWarned] = useState(false)

  useEffect(() => {
    setChoices(Array(question.price_list.length).fill('A'))
    setWarned(false)
  }, [question.question])

  function setChoice(idx, val) {
    setChoices(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  const hasMultipleSwitch = detectMultipleSwitch(choices)

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
        <strong>スイッチは1回だけ</strong>にしてください（上でAを選んだらその後はAを選び続けることを
        推奨しますが、1回だけBに切り替えることができます）。
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
            {question.price_list.map((amount, i) => (
              <tr key={i} className={choices[i] === 'B' ? 'row-b' : 'row-a'}>
                <td>{i + 1}</td>
                <td>上記のくじ</td>
                <td>確実に {amount}円</td>
                <td className="choice-cell">
                  <button
                    className={`choice-btn ${choices[i] === 'A' ? 'active-a' : ''}`}
                    onClick={() => setChoice(i, 'A')}
                  >A</button>
                  <button
                    className={`choice-btn ${choices[i] === 'B' ? 'active-b' : ''}`}
                    onClick={() => setChoice(i, 'B')}
                  >B</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={handleNext}>
        {hasMultipleSwitch && !warned ? '回答を確認（複数スイッチあり）' : '次の問題へ'}
      </button>
    </div>
  )
}
