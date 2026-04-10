import React from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { StartScreen } from './components/StartScreen'
import { GameTable } from './components/GameTable'

function GameContent() {
  const { state, startGame } = useGame()

  if (state.phase === 'idle') {
    return <StartScreen onStart={startGame} />
  }

  return <GameTable />
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}

export default App
