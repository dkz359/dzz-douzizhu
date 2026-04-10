import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { aiController } from '../ai/AIController'
import { AIPlayer } from './AIPlayer'
import { PlayerHand } from './PlayerHand'
import { LandLordPanel } from './LandLordPanel'
import { ActionPanel } from './ActionPanel'
import { ResultModal } from './ResultModal'
import { CardBack } from './Card'
import { canPlayCards } from '../engine/GameCore'

export function GameTable() {
  const { state, startGame, grabLord, playCards, pass, resetGame } = useGame()

  // AI 逻辑
  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'game_over') return

    const currentPlayer = state.currentPlayer
    if (currentPlayer === 'player') return

    // AI 回合
    const aiPlayer = state.players.find(p => p.position === currentPlayer)
    if (!aiPlayer) return

    const timer = setTimeout(() => {
      if (state.phase === 'grabbing_lord') {
        // AI 抢地主决策
        const shouldGrab = aiController.decideGrabLord(state.settings.difficulty, aiPlayer.hand)
        if (shouldGrab) {
          grabLord(currentPlayer)
        }
      } else if (state.phase === 'playing') {
        // AI 出牌决策
        const isFirstPlay = state.lastPlayedPlayer === null
        const result = aiController.decidePlayCard(
          state.settings.difficulty,
          aiPlayer.hand,
          state.lastPlayedCards,
          isFirstPlay
        )

        if (result === 'pass') {
          pass(currentPlayer)
        } else if (Array.isArray(result) && result.length > 0) {
          playCards(currentPlayer, result)
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [state.phase, state.currentPlayer, state, grabLord, playCards, pass])

  const handlePlayCards = useCallback((cards: typeof state.players[0]['hand']) => {
    playCards('player', cards)
  }, [playCards])

  const handlePass = useCallback(() => {
    pass('player')
  }, [pass])

  const player = state.players.find(p => p.position === 'player')!
  const ai1 = state.players.find(p => p.position === 'ai1')!
  const ai2 = state.players.find(p => p.position === 'ai2')!

  const isLordWin = state.winner === state.lordPosition

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-green-700 to-green-900 overflow-hidden">
      {/* 装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 text-8xl">🌿</div>
        <div className="absolute top-1/3 right-1/4 text-6xl">🌱</div>
        <div className="absolute bottom-1/4 left-1/3 text-7xl">🍃</div>
      </div>

      {/* AI 玩家 - 左上 */}
      <AIPlayer player={ai1} isCurrentPlayer={state.currentPlayer === 'ai1'} isLord={ai1.isLord} position="left" />

      {/* AI 玩家 - 右上 */}
      <AIPlayer player={ai2} isCurrentPlayer={state.currentPlayer === 'ai2'} isLord={ai2.isLord} position="right" />

      {/* 底牌区 */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-2">
          {state.bottomCards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <CardBack />
            </motion.div>
          ))}
        </div>
        {state.lordPosition && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-shiba-dark px-4 py-1 rounded-full text-sm font-bold"
          >
            地主
          </motion.div>
        )}
      </div>

      {/* 出牌区 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8">
        {state.lastPlayedCards && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex gap-1 bg-black/30 rounded-xl p-2"
          >
            {state.lastPlayedCards.cards.map(card => (
              <div key={card.id} className="w-10 h-14 bg-white rounded shadow" />
            ))}
          </motion.div>
        )}
      </div>

      {/* 玩家手牌 */}
      <div className="absolute bottom-0 left-0 right-0">
        <PlayerHand
          cards={player.hand}
          isCurrentPlayer={state.currentPlayer === 'player'}
          onPlayCards={handlePlayCards}
          lastPlayedCards={state.lastPlayedCards}
          isFirstPlay={state.lastPlayedPlayer === null}
        />
      </div>

      {/* 抢地主面板 */}
      <AnimatePresence>
        {state.phase === 'grabbing_lord' && (
          <LandLordPanel
            currentPlayer={state.currentPlayer}
            onGrabLord={grabLord}
          />
        )}
      </AnimatePresence>

      {/* 出牌控制面板 */}
      <AnimatePresence>
        {state.phase === 'playing' && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center">
            <ActionPanel
              currentPlayer={state.currentPlayer}
              onPass={handlePass}
              canPass={state.lastPlayedPlayer !== null && state.lastPlayedPlayer !== 'player'}
            />
          </div>
        )}
      </AnimatePresence>

      {/* 结算弹窗 */}
      <ResultModal
        winner={state.winner}
        isLordWin={isLordWin}
        onPlayAgain={() => resetGame()}
        onExit={() => resetGame()}
      />
    </div>
  )
}
