import json
import os
import random
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import csv

from models.session import SessionStartRequest, SessionStartResponse
from models.task_a_result import TaskAResultRequest, TaskARecord
from models.task_b_result import TaskBResultRequest, TaskBRecord
from models.reward import RewardRequest, RewardRecord
from trial_generator import generate_task_a, generate_task_b, generate_reliability, PRICE_LIST_STEPS
from reward_calculator import calculate_reward_task_a, calculate_reward_task_b, compute_switch_point

app = FastAPI(title="CE Experiment API")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
]

# 環境変数でフロントエンドURLを追加（Renderデプロイ時に設定）
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url:
    ALLOWED_ORIGINS.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)


def _session_file(session_id: str) -> Path:
    return DATA_DIR / f"session_{session_id}.json"


def _results_file(student_id: str) -> Path:
    safe = student_id.replace("/", "_").replace("\\", "_")
    return DATA_DIR / f"results_{safe}.json"


def _load_results(student_id: str) -> dict:
    path = _results_file(student_id)
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"task_a": [], "task_b": [], "reward": None}


def _save_results(student_id: str, results: dict) -> None:
    _results_file(student_id).write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )


@app.post("/api/ce/session/start", response_model=SessionStartResponse)
def start_session(req: SessionStartRequest):
    session_id = str(uuid.uuid4())
    task_a = generate_task_a()
    task_b = generate_task_b()
    reliability = generate_reliability(task_a, n=9)

    session_data = {
        "session_id": session_id,
        "student_id": req.student_id,
        "name": req.name,
        "task_a_trials": task_a,
        "task_b_trials": task_b,
        "reliability_trials": reliability,
        "created_at": datetime.now().isoformat(),
    }
    _session_file(session_id).write_text(
        json.dumps(session_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return SessionStartResponse(
        session_id=session_id,
        task_a_trials=task_a,
        task_b_trials=task_b,
        reliability_trials=reliability,
    )


@app.post("/api/ce/results/task_a")
def save_task_a(req: TaskAResultRequest):
    ts = datetime.now().isoformat()
    record = TaskARecord(
        student_id=req.student_id,
        name=req.name,
        trial=req.trial,
        is_reliability=req.is_reliability,
        p=req.p,
        x=req.x,
        ce=req.ce,
        ce_normalized=round(req.ce / req.x, 4),
        timestamp=ts,
    )

    results = _load_results(req.student_id)
    existing = results["task_a"]
    # Upsert: overwrite same trial number
    updated = [r for r in existing if r["trial"] != req.trial]
    updated.append(record.model_dump())
    results["task_a"] = updated
    _save_results(req.student_id, results)

    return {"status": "ok"}


@app.post("/api/ce/results/task_b")
def save_task_b(req: TaskBResultRequest):
    ts = datetime.now().isoformat()
    sp = compute_switch_point(req.raw_choices, PRICE_LIST_STEPS)

    record = TaskBRecord(
        student_id=req.student_id,
        name=req.name,
        question=req.question,
        p=req.p,
        x=req.x,
        switch_lower=sp["switch_lower"],
        switch_upper=sp["switch_upper"],
        ce_estimate=sp["ce_estimate"],
        ce_normalized=round(sp["ce_estimate"] / req.x, 4),
        multiple_switch=sp["multiple_switch"],
        raw_choices=json.dumps(req.raw_choices),
        timestamp=ts,
    )

    results = _load_results(req.student_id)
    existing = results["task_b"]
    updated = [r for r in existing if r["question"] != req.question]
    updated.append(record.model_dump())
    results["task_b"] = updated
    _save_results(req.student_id, results)

    return {"status": "ok"}


@app.post("/api/ce/results/reward")
def compute_reward(req: RewardRequest):
    # Load session to get trial info
    session_file = _session_file(req.session_id)
    if not session_file.exists():
        raise HTTPException(status_code=404, detail="Session not found")
    session_data = json.loads(session_file.read_text(encoding="utf-8"))

    results = _load_results(req.student_id)
    task_a = results["task_a"]
    task_b = results["task_b"]

    if not task_a and not task_b:
        raise HTTPException(status_code=400, detail="No results found")

    # Build pool: task A (non-reliability) + task B
    pool_a = [r for r in task_a if not r.get("is_reliability", False)]
    pool_b = task_b

    total = len(pool_a) + len(pool_b)
    if total == 0:
        raise HTTPException(status_code=400, detail="No results to select from")

    selected_idx = random.randint(0, total - 1)
    ts = datetime.now().isoformat()

    if selected_idx < len(pool_a):
        # Task A selected
        record = pool_a[selected_idx]
        result = calculate_reward_task_a(
            {"x": record["x"], "p": record["p"]}, record["ce"]
        )
        reward_record = RewardRecord(
            student_id=req.student_id,
            selected_task="A",
            selected_index=record["trial"],
            selected_p=record["p"],
            selected_x=record["x"],
            ce_value=record["ce"],
            bdm_amount=result["bdm_amount"],
            selected_certain_amount=None,
            choice_at_row=None,
            lottery_result=result["lottery_result"],
            reward=result["reward"],
            timestamp=ts,
        )
    else:
        # Task B selected
        b_idx = selected_idx - len(pool_a)
        record = pool_b[b_idx]
        raw_choices = json.loads(record["raw_choices"])
        result = calculate_reward_task_b(
            {"price_list": PRICE_LIST_STEPS, "p": record["p"], "x": record["x"]},
            raw_choices,
        )
        reward_record = RewardRecord(
            student_id=req.student_id,
            selected_task="B",
            selected_index=record["question"],
            selected_p=record["p"],
            selected_x=record["x"],
            ce_value=None,
            bdm_amount=None,
            selected_certain_amount=result["selected_certain_amount"],
            choice_at_row=result["choice_at_row"],
            lottery_result=result["lottery_result"],
            reward=result["reward"],
            timestamp=ts,
        )

    results["reward"] = reward_record.model_dump()
    _save_results(req.student_id, results)

    return reward_record.model_dump()


@app.get("/api/ce/results/{student_id}/csv")
def download_csv(student_id: str):
    results = _load_results(student_id)
    if not results["task_a"] and not results["task_b"]:
        raise HTTPException(status_code=404, detail="No data found")

    output = io.StringIO()
    writer = csv.writer(output)

    # Task A rows
    if results["task_a"]:
        writer.writerow([
            "StudentID", "Name", "Task", "Trial", "IsReliability",
            "p", "x", "CE", "CE_normalized", "Timestamp"
        ])
        for r in sorted(results["task_a"], key=lambda x: x["trial"]):
            writer.writerow([
                r["student_id"], r["name"], r["task"], r["trial"],
                r["is_reliability"], r["p"], r["x"], r["ce"],
                r["ce_normalized"], r["timestamp"]
            ])

    # Task B rows
    if results["task_b"]:
        writer.writerow([])
        writer.writerow([
            "StudentID", "Name", "Task", "Question", "p", "x",
            "SwitchLower", "SwitchUpper", "CE_estimate", "CE_normalized",
            "MultipleSwitch", "RawChoices", "Timestamp"
        ])
        for r in sorted(results["task_b"], key=lambda x: x["question"]):
            writer.writerow([
                r["student_id"], r["name"], r["task"], r["question"],
                r["p"], r["x"], r["switch_lower"], r["switch_upper"],
                r["ce_estimate"], r["ce_normalized"],
                r["multiple_switch"], r["raw_choices"], r["timestamp"]
            ])

    # Reward row
    if results["reward"]:
        r = results["reward"]
        writer.writerow([])
        writer.writerow([
            "StudentID", "SelectedTask", "SelectedIndex",
            "SelectedP", "SelectedX", "CE_value",
            "BDM_amount", "SelectedCertainAmount", "ChoiceAtRow",
            "LotteryResult", "Reward", "Timestamp"
        ])
        writer.writerow([
            r["student_id"], r["selected_task"], r["selected_index"],
            r["selected_p"], r["selected_x"], r.get("ce_value"),
            r.get("bdm_amount"), r.get("selected_certain_amount"),
            r.get("choice_at_row"), r["lottery_result"],
            r["reward"], r["timestamp"]
        ])

    ts_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"CE_{student_id}_{ts_str}.csv"
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
