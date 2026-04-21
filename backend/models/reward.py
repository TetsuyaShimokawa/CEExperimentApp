from pydantic import BaseModel
from typing import Optional


class RewardRequest(BaseModel):
    session_id: str
    student_id: str


class RewardRecord(BaseModel):
    student_id: str
    selected_task: str
    selected_index: int
    selected_p: float
    selected_x: int
    ce_value: Optional[float] = None
    bdm_amount: Optional[float] = None
    selected_certain_amount: Optional[float] = None
    choice_at_row: Optional[str] = None
    lottery_result: str
    reward: float
    timestamp: str
