export default function InstructionScreen({ onNext }) {
  return (
    <div className="screen">
      <h1>実験の説明</h1>

      <div className="instruction-box">
        <p>
          この実験では、いくつかのくじについてあなたの評価を答えてもらいます。
        </p>

        <h3>【重要】インセンティブについて</h3>
        <p>
          実験終了後、あなたの回答の中から<strong>1問がランダムに選ばれます</strong>。<br />
          その問題の結果に基づいて実際の報酬が支払われます。<br />
          そのため、各問題に対して<strong>正直な評価を答えることが
          あなたにとって最も有利な戦略</strong>です。
        </p>

        <h3>【課題Aについて】</h3>
        <p>
          くじの「<strong>確実性等価（CE）</strong>」を入力してください。<br />
          確実性等価とは、そのくじと同じくらい価値があると感じる<strong>確実な金額</strong>のことです。
        </p>
        <div className="example-box">
          例：「確率50%で800円のくじ」に対し、あなたが300円の確実な報酬と同じくらい価値があると感じるなら、<br />
          CE = 300円 と入力します。
        </div>

        <h3>【課題Bについて】</h3>
        <p>
          くじと確実な金額のどちらを好むか選んでください。<br />
          表の各行で、くじ（選択肢A）か確実な金額（選択肢B）かを選びます。<br />
          <strong>スイッチは1回だけ</strong>にしてください（上の行でくじを選んだら、なるべくその後もくじを選び続け、
          ある行で確実額に切り替えたら、その後も確実額を選び続けてください）。
        </p>

        <h3>【全体の流れ】</h3>
        <ol>
          <li>課題A：55問（CE直接入力）</li>
          <li>休憩（約2分）</li>
          <li>課題B：11問（Price list選択）</li>
          <li>信頼性確認：9問（課題Aの繰り返し）</li>
          <li>報酬計算・結果表示</li>
        </ol>
        <p>所要時間：約30分</p>
      </div>

      <button className="btn-primary" onClick={onNext}>
        練習問題へ
      </button>
    </div>
  )
}
