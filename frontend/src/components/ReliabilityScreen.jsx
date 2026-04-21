import TaskAScreen from './TaskAScreen'

export default function ReliabilityScreen({ trial, currentNum, totalNum, onAnswer }) {
  return (
    <TaskAScreen
      trial={trial}
      currentNum={currentNum}
      totalNum={totalNum}
      isReliability={true}
      onAnswer={onAnswer}
    />
  )
}
