import random

P_VALS = [0.01, 0.05, 0.10, 0.25, 0.40, 0.50, 0.60, 0.75, 0.90, 0.95, 0.99]
X_VALS_A = [100, 400, 800]
X_B = 800
PRICE_LIST_STEPS = [int(X_B * i * 0.05) for i in range(1, 20)]
# = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 680, 720, 760]


def generate_task_a():
    trials = []
    for x in X_VALS_A:
        for p in P_VALS:
            trials.append({"p": p, "x": x})
    random.shuffle(trials)
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
            "price_list": PRICE_LIST_STEPS,
        })
    random.shuffle(questions)
    for i, q in enumerate(questions):
        q["question"] = i + 1
    return questions


def generate_reliability(task_a_trials, n=9):
    selected = random.sample(task_a_trials, n)
    reliability = []
    for i, t in enumerate(selected):
        reliability.append({
            "trial": 33 + i + 1,
            "p": t["p"],
            "x": t["x"],
            "original_trial": t["trial"],
        })
    return reliability
