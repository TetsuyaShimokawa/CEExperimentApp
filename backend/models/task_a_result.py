from pydantic import BaseModel


class TaskAResultRequest(BaseModel):
    session_id: str
    student_id: str
    name: str
    trial: int
    is_reliability: bool
    p: float
    x: int
    ce: float


class TaskARecord(BaseModel):
    student_id: str
    name: str
    task: str = "A"
    trial: int
    is_reliability: bool
    p: float
    x: int
    ce: float
    ce_normalized: float
    timestamp: str
