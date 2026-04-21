import { useState } from 'react'
import { startSession, saveTaskA, saveTaskB } from './api/client'

import SetupScreen from './components/SetupScreen'
import InstructionScreen from './components/InstructionScreen'
import PracticeScreen from './components/PracticeScreen'
import TaskAScreen from './components/TaskAScreen'
import BreakScreen from './components/BreakScreen'
import TaskBScreen from './components/TaskBScreen'
import ReliabilityScreen from './components/ReliabilityScreen'
import RewardScreen from './components/RewardScreen'
import FinishScreen from './components/FinishScreen'

import './App.css'

const SCREENS = {
  SETUP: 'setup',
  INSTRUCTIONS: 'instructions',
  PRACTICE: 'practice',
  TASK_A: 'task_a',
  BREAK: 'break',
  TASK_B: 'task_b',
  RELIABILITY: 'reliability',
  REWARD: 'reward',
  FINISH: 'finish',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP)
  const [session, setSession] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [taskAIndex, setTaskAIndex] = useState(0)
  const [taskBIndex, setTaskBIndex] = useState(0)
  const [relIndex, setRelIndex] = useState(0)

  async function handleSetupStart(studentId, name) {
    const data = await startSession(studentId, name)
    setSession(data)
    setStudentInfo({ studentId, name })
    setScreen(SCREENS.INSTRUCTIONS)
  }

  async function handleTaskAAnswer(ceValue) {
    const trial = session.task_a_trials[taskAIndex]
    await saveTaskA({
      session_id: session.session_id,
      student_id: studentInfo.studentId,
      name: studentInfo.name,
      trial: trial.trial,
      is_reliability: false,
      p: trial.p,
      x: trial.x,
      ce: ceValue,
    })
    const next = taskAIndex + 1
    if (next >= session.task_a_trials.length) {
      setScreen(SCREENS.BREAK)
    } else {
      setTaskAIndex(next)
    }
  }

  async function handleTaskBAnswer(choices) {
    const q = session.task_b_trials[taskBIndex]
    await saveTaskB({
      session_id: session.session_id,
      student_id: studentInfo.studentId,
      name: studentInfo.name,
      question: q.question,
      p: q.p,
      x: q.x,
      raw_choices: choices,
    })
    const next = taskBIndex + 1
    if (next >= session.task_b_trials.length) {
      setScreen(SCREENS.RELIABILITY)
    } else {
      setTaskBIndex(next)
    }
  }

  async function handleReliabilityAnswer(ceValue) {
    const trial = session.reliability_trials[relIndex]
    await saveTaskA({
      session_id: session.session_id,
      student_id: studentInfo.studentId,
      name: studentInfo.name,
      trial: trial.trial,
      is_reliability: true,
      p: trial.p,
      x: trial.x,
      ce: ceValue,
    })
    const next = relIndex + 1
    if (next >= session.reliability_trials.length) {
      setScreen(SCREENS.REWARD)
    } else {
      setRelIndex(next)
    }
  }

  if (screen === SCREENS.SETUP) return <SetupScreen onStart={handleSetupStart} />
  if (screen === SCREENS.INSTRUCTIONS) return <InstructionScreen onNext={() => setScreen(SCREENS.PRACTICE)} />
  if (screen === SCREENS.PRACTICE) return <PracticeScreen onNext={() => setScreen(SCREENS.TASK_A)} />

  if (screen === SCREENS.TASK_A) {
    const trial = session.task_a_trials[taskAIndex]
    return (
      <TaskAScreen
        key={trial.trial}
        trial={trial}
        currentNum={taskAIndex + 1}
        totalNum={session.task_a_trials.length}
        isReliability={false}
        onAnswer={handleTaskAAnswer}
      />
    )
  }

  if (screen === SCREENS.BREAK) return <BreakScreen onNext={() => setScreen(SCREENS.TASK_B)} />

  if (screen === SCREENS.TASK_B) {
    const question = session.task_b_trials[taskBIndex]
    return (
      <TaskBScreen
        key={question.question}
        question={question}
        currentNum={taskBIndex + 1}
        totalNum={session.task_b_trials.length}
        onAnswer={handleTaskBAnswer}
      />
    )
  }

  if (screen === SCREENS.RELIABILITY) {
    const trial = session.reliability_trials[relIndex]
    return (
      <ReliabilityScreen
        key={trial.trial}
        trial={trial}
        currentNum={relIndex + 1}
        totalNum={session.reliability_trials.length}
        onAnswer={handleReliabilityAnswer}
      />
    )
  }

  if (screen === SCREENS.REWARD) {
    return (
      <RewardScreen
        sessionId={session.session_id}
        studentId={studentInfo.studentId}
        onNext={() => setScreen(SCREENS.FINISH)}
      />
    )
  }

  if (screen === SCREENS.FINISH) return <FinishScreen studentId={studentInfo.studentId} />

  return null
}
