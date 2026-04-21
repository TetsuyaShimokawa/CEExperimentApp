import { csvDownloadUrl } from '../api/client'

export default function FinishScreen({ studentId }) {
  const url = csvDownloadUrl(studentId)

  return (
    <div className="screen">
      <h1>実験完了</h1>
      <p>
        すべての課題が終了しました。<br />
        以下のボタンからデータをダウンロードしてください。
      </p>

      <a href={url} download className="btn-download">
        CSVをダウンロード
      </a>

      <p className="hint" style={{ marginTop: '2rem' }}>
        ダウンロード後、このページを閉じてください。
      </p>
    </div>
  )
}
