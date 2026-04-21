# CEExperimentApp Web版 仕様書

## 概要
確率荷重関数を個人レベルで推定するWebアプリケーション。
Gonzalez & Wu (1999)の設計に準拠し、Wilcox(2017)の警告に対処するため
CE直接入力（課題A）とPrice list選択課題（課題B）を組み合わせる。
BDMランダムインセンティブ付き。

## 技術スタック
- **フロントエンド**: React (Vite)
- **バックエンド**: FastAPI (Python)
- **デプロイ**: Render
- **GitHubユーザー**: TetsuyaShimokawa
- **リポジトリ名**: CEExperimentApp

---

## 実験の理論的背景

### 目的
- 確率荷重関数 w(p) を個人レベルで推定する
- 逆S字型（小確率の過大評価・大確率の過小評価）を検出する
- Wilcox(2017)のバイアス（CEのみでは識別不能問題）に対処する

### Wilcox(2017)対策
CE直接入力だけでは、EUT＋ランダム選好でも逆S字が「模倣」される。
そのため、**同じ刺激**に対して以下の2課題を実施し、両方から同じw(p)が
推定されることを確認する：
- **課題A**：CE直接入力（Gonzalez & Wu 1999スタイル）
- **課題B**：Price list選択課題（Holt-Laury的構造）

---

## 刺激セット

### 確率水準（11点：Gonzalez & Wu 1999準拠）
```
p_vals = [0.01, 0.05, 0.10, 0.25, 0.40, 0.50, 0.60, 0.75, 0.90, 0.95, 0.99]
```

### 金額セット
```
# 課題A：5種類の金額（シンプルな二値くじ (x, p; 0, 1-p) のみ）
x_vals_A = [50, 100, 200, 400, 800]  # 円

# 課題B：800円固定
x_B = 800  # 円
```

### 試行数
| ブロック | 内容 | 試行数 |
|---------|------|--------|
| 課題A | CE直接入力（11確率×5金額） | 55試行 |
| 課題B | Price list（11確率×1金額×19行） | 11問（209行） |
| 信頼性確認 | 課題Aからランダム9試行を繰り返し | 9試行 |
| **合計** | | **約75試行（所要時間約30分）** |

### くじの形式
**二値くじのみ**：(x, p; 0, 1-p)
- 確率pでx円を得る
- 確率(1-p)で0円を得る
- 三値くじは使用しない

---

## 実験の流れ

```
セットアップ画面（学籍番号・氏名入力）
　↓
実験説明画面（BDMインセンティブの説明を含む）
　↓
練習問題（2〜3問）
　↓
課題A：CE直接入力（55試行）
　↓
休憩画面（2分）
　↓
課題B：Price list（11問）
　↓
信頼性確認（課題Aの繰り返し9試行）
　↓
終了・結果表示・報酬計算画面
　↓
CSVダウンロード画面
```

---

## 各画面の仕様

### 画面0：セットアップ
- 学籍番号入力（テキスト）
- 氏名入力（テキスト）
- 「実験を始める」ボタン

### 画面1：実験説明
以下の内容を表示：
```
この実験では、いくつかのくじについてあなたの評価を答えてもらいます。

【重要】インセンティブについて
実験終了後、あなたの回答の中から1問がランダムに選ばれます。
その問題の結果に基づいて実際の報酬が支払われます。
そのため、各問題に対して正直な評価を答えることが
あなたにとって最も有利な戦略です。

【課題Aについて】
くじの「確実性等価（CE）」を入力してください。
確実性等価とは、そのくじと同じくらい価値があると感じる
確実な金額のことです。

【課題Bについて】
くじと確実な金額のどちらを好むか選んでください。
```
ボタン：「練習問題へ」

### 画面2：練習問題
課題AとBそれぞれ1〜2問の練習
「これは練習問題です」と明示
ボタン：「本番を始める」

### 画面3：課題A（CE直接入力）

**表示内容：**
```
課題A（XX/55）

以下のくじの確実性等価（CE）を入力してください。
「このくじと同じくらい価値があると感じる確実な金額」を答えてください。

┌─────────────────────────────────┐
│  確率 XX% で XX円が当たる        │
│  確率 XX% で 0円（ハズレ）       │
└─────────────────────────────────┘

あなたの確実性等価：[        ] 円

有効範囲：0円 〜 XX円（くじの最高額）
```

**入力バリデーション：**
- 0以上、くじの最高額(x)以下
- 数値のみ

**ボタン：** 「次へ」（入力後に有効化）

**進捗バー：** 課題A全体の進捗（55試行中）

### 画面4：休憩画面
```
課題Aが終了しました。お疲れ様でした。
2分間休憩してから課題Bを始めてください。

課題Bでは、くじと確実な金額のどちらを好むか
選んでいただきます。
```
カウントダウンタイマー（2分）
タイマー終了後「課題Bへ」ボタンが有効化

### 画面5：課題B（Price list）

**表示内容：**
```
課題B（XX/11問）

以下のくじについて、各行でどちらを好むか選んでください。
スイッチは1回だけにしてください（上でAを選んだらその後はAを選び続けることを
推奨しますが、1回だけBに切り替えることができます）。

くじ：確率 XX% で XX円、確率 XX% で 0円

┌────┬──────────────────────┬──────────────┬────────┐
│ 行 │        選択肢A        │   選択肢B    │  選択  │
├────┼──────────────────────┼──────────────┼────────┤
│  1 │ 上記のくじ           │ 確実に  40円 │ A / B  │
│  2 │ 上記のくじ           │ 確実に  80円 │ A / B  │
│  3 │ 上記のくじ           │ 確実に 120円 │ A / B  │
│ .. │ ...                  │ ...          │ ...    │
│ 19 │ 上記のくじ           │ 確実に 760円 │ A / B  │
└────┴──────────────────────┴──────────────┴────────┘
```

**Price listの確実額：**
800円の5%刻み：40, 80, 120, 160, 200, 240, 280, 320, 360, 400,
440, 480, 520, 560, 600, 640, 680, 720, 760（19行）

**バリデーション：**
- スイッチポイントが複数ある場合（B→A→Bなど）は警告を表示
  「通常、上の行でBを選んだら下の行でもBを選びます。
   回答を確認してください。」
- ただし強制はせず、そのまま進むことも可能

**ボタン：** 「次の問題へ」

### 画面6：信頼性確認（課題Aの繰り返し）
```
もう少しで終わりです。（信頼性確認：XX/9）

先ほどと同じ形式の問題です。
引き続き正直な評価を答えてください。
```
課題Aと同じ形式で9試行

### 画面7：終了・結果表示・報酬計算

```
実験が終了しました。ありがとうございました！

【報酬の決定】
あなたの回答の中から、問題番号 XX がランダムに選ばれました。

選ばれた問題：確率 XX% で 800円のくじ
あなたの回答：CE = XXX円

────────────────────────────────
[課題Aから選ばれた場合：BDM法]
コンピュータが生成した金額：YYY円

YYY < XXX（あなたのCE）の場合：
→ くじをプレイします
→ 結果：[当選/ハズレ]
→ あなたの報酬：ZZZ円

YYY ≥ XXX（あなたのCE）の場合：
→ 確実額 YYY円を獲得
→ あなたの報酬：YYY円
────────────────────────────────

[課題Bから選ばれた場合：Price list]
あなたのスイッチポイント：XXX円と YYY円の間
→ 選択された行：確実にZZZ円
→ あなたが選んだ：[くじ/確実額]
→ くじをプレイした場合：[当選/ハズレ]
→ あなたの報酬：WWW円
────────────────────────────────
```

ボタン：「データをダウンロード」

---

## データ記録

### 課題Aの記録（1行 = 1試行）
| カラム名 | 型 | 内容 |
|---------|-----|------|
| StudentID | string | 学籍番号 |
| Name | string | 氏名 |
| Task | string | "A" |
| Trial | integer | 試行番号（1〜55） |
| IsReliability | boolean | 信頼性確認試行か |
| p | float | 確率（0.01〜0.99） |
| x | integer | 金額（50,100,200,400,800） |
| CE | float | 入力されたCE |
| CE_normalized | float | CE/x（正規化CE） |
| Timestamp | string | 記録日時 |

### 課題Bの記録（1行 = 1問のサマリー）
| カラム名 | 型 | 内容 |
|---------|-----|------|
| StudentID | string | 学籍番号 |
| Name | string | 氏名 |
| Task | string | "B" |
| Question | integer | 問番号（1〜11） |
| p | float | 確率（0.01〜0.99） |
| x | integer | 800固定 |
| SwitchLower | float | スイッチ前の確実額 |
| SwitchUpper | float | スイッチ後の確実額 |
| CE_estimate | float | (SwitchLower+SwitchUpper)/2 |
| CE_normalized | float | CE_estimate/800 |
| MultipleSwitch | boolean | 複数スイッチがあったか |
| RawChoices | string | 19行の選択をJSON文字列で記録 |
| Timestamp | string | 記録日時 |

### 報酬記録
| カラム名 | 型 | 内容 |
|---------|-----|------|
| StudentID | string | 学籍番号 |
| SelectedTask | string | "A" or "B" |
| SelectedTrial | integer | 選ばれた試行番号 |
| BDM_amount | float | BDMで生成された金額（課題Aのみ） |
| LotteryResult | string | "Win" or "Lose" or "N/A" |
| Reward | float | 最終報酬額 |

---

## バックエンドAPI（FastAPI）

### `POST /api/ce/session/start`
セッション開始・全試行を生成

**リクエスト：**
```json
{
  "student_id": "12345",
  "name": "山田太郎"
}
```

**レスポンス：**
```json
{
  "session_id": "uuid",
  "task_a_trials": [
    {"trial": 1, "p": 0.01, "x": 50},
    ...
  ],
  "task_b_trials": [
    {"question": 1, "p": 0.01, "x": 800,
     "price_list": [40, 80, 120, ..., 760]},
    ...
  ],
  "reliability_trials": [
    {"trial": 56, "p": 0.25, "x": 200},
    ...
  ]
}
```

### `POST /api/ce/results/task_a`
課題Aの結果を1件保存（同一StudentID+Trialは上書き）

### `POST /api/ce/results/task_b`
課題Bの結果を1件保存

### `POST /api/ce/results/reward`
報酬計算結果を保存

### `GET /api/ce/results/{student_id}/csv`
全データをCSVダウンロード
ファイル名：`CE_{student_id}_{YYYYMMDD_HHMMSS}.csv`

---

## フロントエンド構成（React）

```
src/
├── App.jsx
├── components/
│   ├── SetupScreen.jsx
│   ├── InstructionScreen.jsx
│   ├── PracticeScreen.jsx
│   ├── TaskAScreen.jsx          # CE直接入力
│   ├── BreakScreen.jsx          # 休憩・カウントダウン
│   ├── TaskBScreen.jsx          # Price list
│   ├── ReliabilityScreen.jsx    # 信頼性確認
│   ├── RewardScreen.jsx         # 報酬計算・結果表示
│   ├── FinishScreen.jsx         # CSVダウンロード
│   └── ProgressBar.jsx
├── hooks/
│   └── useSession.js
└── api/
    └── client.js
```

---

## バックエンド構成（FastAPI）

```
backend/
├── main.py
├── trial_generator.py    # 試行生成・ランダム化ロジック
├── reward_calculator.py  # BDM報酬計算ロジック
├── models/
│   ├── session.py
│   ├── task_a_result.py
│   ├── task_b_result.py
│   └── reward.py
└── requirements.txt
```

---

## 試行生成ロジック

```python
import random

P_VALS = [0.01, 0.05, 0.10, 0.25, 0.40, 0.50,
          0.60, 0.75, 0.90, 0.95, 0.99]
X_VALS_A = [50, 100, 200, 400, 800]
X_B = 800
PRICE_LIST_STEPS = [int(X_B * i * 0.05) for i in range(1, 20)]
# = [40, 80, 120, ..., 760]

def generate_task_a():
    trials = []
    trial_num = 1
    for x in X_VALS_A:
        for p in P_VALS:
            trials.append({"trial": trial_num, "p": p, "x": x})
            trial_num += 1
    random.shuffle(trials)
    # 試行番号を振り直す
    for i, t in enumerate(trials):
        t["trial"] = i + 1
    return trials

def generate_task_b():
    questions = []
    for i, p in enumerate(P_VALS):
        questions.append({
            "question": i + 1,
            "p": p,
            "x": X_B,
            "price_list": PRICE_LIST_STEPS
        })
    random.shuffle(questions)
    return questions

def generate_reliability(task_a_trials, n=9):
    # 課題Aからランダムに9試行を選んで繰り返す
    selected = random.sample(task_a_trials, n)
    return selected
```

---

## BDM報酬計算ロジック

```python
import random

def calculate_reward(task, trial_data, ce_value, lottery_result=None):
    if task == "A":
        # BDM法
        bdm_amount = random.uniform(0, trial_data["x"])
        if ce_value <= bdm_amount:
            # 確実額を獲得
            return {
                "bdm_amount": bdm_amount,
                "lottery_result": "N/A",
                "reward": bdm_amount
            }
        else:
            # くじをプレイ
            win = random.random() < trial_data["p"]
            reward = trial_data["x"] if win else 0
            return {
                "bdm_amount": bdm_amount,
                "lottery_result": "Win" if win else "Lose",
                "reward": reward
            }
    elif task == "B":
        # スイッチポイントの行を実行
        # switch_lower以下→くじを選んでいる、switch_upper以上→確実額を選んでいる
        # ランダムに境界付近の行を選択（中間の確実額）
        selected_amount = (trial_data["switch_lower"] + trial_data["switch_upper"]) / 2
        # その金額で被験者はくじを選んでいたか確実額を選んでいたかを確認
        # → switch_lower < selected_amount → くじを選んでいた
        win = random.random() < trial_data["p"]
        reward = trial_data["x"] if win else 0
        return {
            "selected_amount": selected_amount,
            "lottery_result": "Win" if win else "Lose",
            "reward": reward
        }
```

---

## UIデザインの注意点

- 確率は「XX%」形式で表示（小数点なし、または1桁まで）
  例：0.01 → 「1%」、0.25 → 「25%」
- 金額は「XX円」形式
- 課題AのCE入力フィールドには有効範囲を明示（0〜くじの最高額）
- 課題BのPrice listはテーブル形式、選択済みの行をハイライト
- 複数スイッチ警告は赤文字で表示、ただし強制変更はしない
- 進捗バーを全画面上部に表示
- 報酬計算画面は結果をわかりやすく大きく表示

---

## Claude Codeへの指示文

```
この仕様書（CEExperimentApp_spec.md）と
添付のMATLABアプリ（CE_Experiment_App.mlapp, CE_Experiment_App2.mlapp,
CE_task_GonzalezWuStyle.m）を参照して、
確率荷重関数推定実験のWebアプリを作成してください。

リポジトリ名：CEExperimentApp
GitHubユーザー：TetsuyaShimokawa

フォルダ構成：
- frontend/（React + Vite）
- backend/（FastAPI）

MATLABアプリからの主な変更点：
1. 二値くじのみに限定（三値くじは削除）
2. 確率水準を11点に拡張（0.01〜0.99）
3. 課題Aと課題Bの2課題構成に変更
4. BDMランダムインセンティブを追加
5. 終了後に報酬計算結果を表示
6. 信頼性確認試行（9試行）を追加

重要な実装の注意点：
- 課題A：CE入力は0〜くじ最高額の範囲でバリデーション
- 課題B：複数スイッチを検出して警告（強制変更はしない）
- 試行順序はセッション開始時にバックエンドでランダム化
- 同一StudentID+Trialの回答は上書き保存
- CORSはlocalhost:5173、5174と後で設定するRenderのURLを許可

まずbackendから作成し、次にfrontendを作成してください。
```
