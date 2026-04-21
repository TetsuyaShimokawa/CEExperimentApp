import random


def calculate_reward_task_a(trial_data: dict, ce_value: float) -> dict:
    x = trial_data["x"]
    p = trial_data["p"]
    bdm_amount = round(random.uniform(0, x), 1)

    if ce_value <= bdm_amount:
        return {
            "bdm_amount": bdm_amount,
            "lottery_result": "N/A",
            "reward": bdm_amount,
        }
    else:
        win = random.random() < p
        reward = x if win else 0
        return {
            "bdm_amount": bdm_amount,
            "lottery_result": "Win" if win else "Lose",
            "reward": reward,
        }


def calculate_reward_task_b(trial_data: dict, raw_choices: list[str]) -> dict:
    price_list = trial_data["price_list"]
    p = trial_data["p"]
    x = trial_data["x"]

    # Randomly select one row (0-indexed)
    selected_row = random.randint(0, len(price_list) - 1)
    selected_amount = price_list[selected_row]
    choice_at_row = raw_choices[selected_row] if selected_row < len(raw_choices) else "A"

    if choice_at_row == "A":
        # Participant chose lottery at this row → play lottery
        win = random.random() < p
        reward = x if win else 0
        return {
            "selected_row": selected_row + 1,
            "selected_certain_amount": selected_amount,
            "choice_at_row": "くじ",
            "lottery_result": "Win" if win else "Lose",
            "reward": reward,
        }
    else:
        # Participant chose certain amount
        return {
            "selected_row": selected_row + 1,
            "selected_certain_amount": selected_amount,
            "choice_at_row": "確実額",
            "lottery_result": "N/A",
            "reward": selected_amount,
        }


def compute_switch_point(choices: list[str], price_list: list[int]) -> dict:
    first_b = None
    for i, c in enumerate(choices):
        if c == "B":
            first_b = i
            break

    if first_b is None:
        switch_lower = price_list[-1]
        switch_upper = 800
    elif first_b == 0:
        switch_lower = 0
        switch_upper = price_list[0]
    else:
        switch_lower = price_list[first_b - 1]
        switch_upper = price_list[first_b]

    ce_estimate = (switch_lower + switch_upper) / 2

    transitions = sum(1 for i in range(1, len(choices)) if choices[i] != choices[i - 1])
    multiple_switch = transitions > 1

    return {
        "switch_lower": switch_lower,
        "switch_upper": switch_upper,
        "ce_estimate": ce_estimate,
        "multiple_switch": multiple_switch,
    }
