import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { GameState, GameAction, Card, PlayerPosition } from '../types'
import { createInitialState, gameReducer } from '../engine/GameCore'

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  startGame: (settings: { difficulty: 'easy' | 'normal' | 'hard' }) => void
  grabLord: (position: PlayerPosition) => void
  passGrab: (position: PlayerPosition) => void
  playCards: (position: PlayerPosition, cards: Card[]) => void
  pass: (position: PlayerPosition) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState())

  const startGame = (settings: { difficulty: 'easy' | 'normal' | 'hard' }) => {
    dispatch({ type: 'START_GAME', settings })
  }

  const grabLord = (position: PlayerPosition) => {
    dispatch({ type: 'GRAB_LORD', position })
  }

  const passGrab = (position: PlayerPosition) => {
    dispatch({ type: 'PASS_GRAB', position })
  }

  const playCards = (position: PlayerPosition, cards: Card[]) => {
    dispatch({ type: 'PLAY_CARDS', position, cards })
  }

  const pass = (position: PlayerPosition) => {
    dispatch({ type: 'PASS', position })
  }

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  return (
    <GameContext.Provider value={{ state, dispatch, startGame, grabLord, passGrab, playCards, pass, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}