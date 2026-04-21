import { useEffect, useState } from 'react'
import { computeReward } from '../api/client'

function fmt_p(p) {
  const pct = p * 100
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`
}

export default function RewardScreen({ sessionId, studentId, onNext }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    computeReward(sessionId, studentId)
      .then(setResult)
      .catch(err => setError(err.message))
  }, [sessionId, studentId])

  if (error) {
    return (
      <div className="screen">
        <h1>エラー</h1>
        <p className="error">{error}</p>
        <button className="btn-primary" onClick={onNext}>続ける</button>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="screen">
        <h1>報酬を計算中...</h1>
        <div className="spinner" />
      </div>
    )
  }

  const isTaskA = result.selected_task === 'A'

  return (
    <div className="screen">
      <h1>実験が終了しました</h1>
      <p className="thanks">ありがとうございました！</p>

      <div className="reward-box">
        <h2>報酬の決定</h2>

        <div className="reward-selected">
          <p>
            あなたの回答の中から、<br />
            <strong>課題{result.selected_task}・問題番号 {result.selected_index}</strong> がランダムに選ばれました。
          </p>
          <p>
            選ばれた問題：確率 <strong>{fmt_p(result.selected_p)}</strong> で{' '}
            <strong>{result.selected_x}円</strong> のくじ
          </p>
        </div>

        <hr />

        {isTaskA ? (
          <div className="reward-detail">
            <p><strong>【BDM法による決定】</strong></p>
            <p>あなたの回答：CE = <strong>{result.ce_value}円</strong></p>
            <p>コンピュータが生成した金額：<strong>{result.bdm_amount}円</strong></p>

            {result.bdm_amount >= result.ce_value ? (
              <>
                <p className="reward-rule">
                  {result.bdm_amount}円 ≥ {result.ce_value}円（あなたのCE）<br />
                  → <strong>確実額 {result.bdm_amount}円を獲得</strong>
                </p>
                <div className="reward-amount">
                  あなたの報酬：<span>{result.reward}円</span>
                </div>
              </>
            ) : (
              <>
                <p className="reward-rule">
                  {result.bdm_amount}円 &lt; {result.ce_value}円（あなたのCE）<br />
                  → くじをプレイします
                </p>
                <p>くじの結果：<strong className={result.lottery_result === 'Win' ? 'win' : 'lose'}>
                  {result.lottery_result === 'Win' ? '当選！' : 'ハズレ'}
                </strong></p>
                <div className="reward-amount">
                  あなたの報酬：<span>{result.reward}円</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="reward-detail">
            <p><strong>【Price list による決定】</strong></p>
            <p>
              選択された行：確実に <strong>{result.selected_certain_amount}円</strong>
            </p>
            <p>
              あなたが選んだ：<strong>{result.choice_at_row}</strong>
            </p>
            {result.choice_at_row === 'くじ' ? (
              <>
                <p>くじの結果：<strong className={result.lottery_result === 'Win' ? 'win' : 'lose'}>
                  {result.lottery_result === 'Win' ? '当選！' : 'ハズレ'}
                </strong></p>
                <div className="reward-amount">
                  あなたの報酬：<span>{result.reward}円</span>
                </div>
              </>
            ) : (
              <div className="reward-amount">
                あなたの報酬：<span>{result.reward}円</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="btn-primary" onClick={onNext}>
        データをダウンロードする
      </button>
    </div>
  )
}
