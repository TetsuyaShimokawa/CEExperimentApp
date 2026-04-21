from pydantic import BaseModel


class SessionStartRequest(BaseModel):
    student_id: str
    name: str


class TrialA(BaseModel):
    trial: int
    p: float
    x: int


class TrialB(BaseModel):
    question: int
    p: float
    x: int
    price_list: list[int]


class ReliabilityTrial(BaseModel):
    trial: int
    p: float
    x: int
    original_trial: int


class SessionStartResponse(BaseModel):
    session_id: str
    task_a_trials: list[TrialA]
    task_b_trials: list[TrialB]
    reliability_trials: list[ReliabilityTrial]
