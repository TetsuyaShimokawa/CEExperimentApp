from pydantic import BaseModel


class TaskBResultRequest(BaseModel):
    session_id: str
    student_id: str
    name: str
    question: int
    p: float
    x: int
    raw_choices: list[str]


class TaskBRecord(BaseModel):
    student_id: str
    name: str
    task: str = "B"
    question: int
    p: float
    x: int
    switch_lower: float
    switch_upper: float
    ce_estimate: float
    ce_normalized: float
    multiple_switch: bool
    raw_choices: str
    timestamp: str
