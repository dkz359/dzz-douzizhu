import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { aiController } from '../ai/AIController'
import { AIPlayer } from './AIPlayer'
import { PlayerHand } from './PlayerHand'
import { LandLordPanel } from './LandLordPanel'
import { ActionPanel } from './ActionPanel'
import { ResultModal } from './ResultModal'
import { Card as CardComponent, CardBack } from './Card'
import { Card } from '../types'
import { canPlayCards } from '../engine/GameCore'

export function GameTable() {
  const { state, startGame, grabLord, passGrab, playCards, pass, resetGame, dispatch } = useGame()

  // Game phase transitions and AI logic
  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'game_over') return

    // Deal animation completed - transition to lord grabbing phase
    if (state.phase === 'dealing') {
      const DEAL_DURATION = 16 * 50 + 300
      // 16 cards before last × 50ms delay + 300ms animation = ~1.1s
      const timer = setTimeout(() => {
        dispatch({ type: 'DEAL_CARDS' })
      }, DEAL_DURATION)
      return () => clearTimeout(timer)
    }

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
        } else {
          passGrab(currentPlayer)
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
  }, [state.phase, state.currentPlayer, state.settings.difficulty, state.lastPlayedPlayer, state.lastPlayedCards, grabLord, playCards, pass])

  const handlePlayCards = useCallback((cards: typeof state.players[0]['hand']) => {
    playCards('player', cards)
  }, [playCards])

  const handlePass = useCallback(() => {
    pass('player')
  }, [pass])

  // Helper component to render played cards area with text
  const PlayedCardsArea = ({ cards, position }: { cards: Card[], position: string }) => (
    <motion.div
      initial={false}
      animate={{ scale: 1 }}
      className="flex gap-1 bg-black/30 rounded-xl p-2"
    >
      {cards.map(card => (
        <CardComponent key={card.id} card={card} isSmall={position !== 'player'} />
      ))}
    </motion.div>
  )

  // Helper to render status text (for grabbing phase or pass)
  const StatusText = ({ text, position }: { text: string, position: string }) => (
    <motion.div
      initial={false}
      animate={{ scale: 1 }}
      className="bg-black/30 rounded-xl px-4 py-2"
    >
      <span className="text-white text-lg font-bold">{text}</span>
    </motion.div>
  )

  // Determine what to show in a player's played cards area
  const getPlayerAreaDisplay = (pos: 'player' | 'ai1' | 'ai2'): { type: 'text'; text: string } | { type: 'cards'; cards: Card[] } | null => {
    if (state.phase === 'grabbing_lord') {
      const decision = state.grabDecisions[pos]
      if (decision === 'grabbed') return { type: 'text', text: '抢地主' }
      if (decision === 'passed') return { type: 'text', text: '不抢' }
      return null
    }
    if (state.phase === 'playing') {
      const playedCards = state.roundPlayedCards[pos]
      if (playedCards && playedCards.length > 0) {
        return { type: 'cards', cards: playedCards }
      }
      // Only show "不出" if someone else has actually played (not just at round start)
      if (state.lastPlayedPlayer !== null && state.lastPlayedPlayer !== pos && state.lastPlayedCards !== null) {
        return { type: 'text', text: '不出' }
      }
      return null
    }
    return null
  }

  const player = state.players.find(p => p.position === 'player')!
  const ai1 = state.players.find(p => p.position === 'ai1')!
  const ai2 = state.players.find(p => p.position === 'ai2')!

  const playerCanPass = state.lastPlayedPlayer !== null && state.lastPlayedPlayer !== 'player'

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
      <AIPlayer
  player={ai1}
  isCurrentPlayer={state.currentPlayer === 'ai1'}
  isLord={ai1.isLord}
  position="left"
  grabStatus={state.grabDecisions.ai1}
  gamePhase={state.phase}
/>

      {/* AI 玩家 - 右上 */}
      <AIPlayer
  player={ai2}
  isCurrentPlayer={state.currentPlayer === 'ai2'}
  isLord={ai2.isLord}
  position="right"
  grabStatus={state.grabDecisions.ai2}
  gamePhase={state.phase}
/>

      {/* 底牌区 - 仅在发牌阶段显示 */}
      {state.phase === 'dealing' && (
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
      )}

      {/* AI1 出牌区 - 左侧 */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2">
        {(() => {
          const display = getPlayerAreaDisplay('ai1')
          if (!display) return null
          if (display.type === 'text') return <StatusText text={display.text} position="ai1" />
          return <PlayedCardsArea cards={display.cards} position="ai1" />
        })()}
      </div>

      {/* AI2 出牌区 - 右侧 */}
      <div className="absolute top-1/3 right-1/4 translate-x-1/2">
        {(() => {
          const display = getPlayerAreaDisplay('ai2')
          if (!display) return null
          if (display.type === 'text') return <StatusText text={display.text} position="ai2" />
          return <PlayedCardsArea cards={display.cards} position="ai2" />
        })()}
      </div>

      {/* 玩家出牌区 - 中央下方 */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
        {(() => {
          const display = getPlayerAreaDisplay('player')
          if (!display) return null
          if (display.type === 'text') return <StatusText text={display.text} position="player" />
          return <PlayedCardsArea cards={display.cards} position="player" />
        })()}
      </div>

      {/* 玩家头像和信息 - 左下角 */}
      <div className="absolute bottom-8 left-8 flex flex-col items-center gap-2">
        <div className={`
          w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-3xl
          border-4 ${player.isLord ? 'border-yellow-400' : 'border-orange-300'}
          ${state.currentPlayer === 'player' ? 'ring-4 ring-yellow-400 ring-opacity-70 rounded-xl animate-pulse' : ''}
        `}>
          🧑
        </div>
        <div className="text-center">
          <div className="text-white font-bold text-sm drop-shadow-lg">
            {player.name}
          </div>
          <div className="flex flex-col items-center gap-0.5 mt-1">
            {player.isLord ? (
              <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                地主
              </div>
            ) : state.phase === 'playing' ? (
              <div className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                农民
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 玩家手牌 */}
      <div className="absolute bottom-0 left-0 right-0">
        <PlayerHand
          cards={player.hand}
          isCurrentPlayer={state.currentPlayer === 'player'}
          onPlayCards={handlePlayCards}
          isFirstPlay={state.lastPlayedPlayer === null}
          canPass={playerCanPass}
          onPass={handlePass}
        />
      </div>

      {/* 抢地主面板 */}
      <AnimatePresence>
        {state.phase === 'grabbing_lord' && (
          <LandLordPanel
            currentPlayer={state.currentPlayer}
            grabDecision={state.grabDecisions.player}
            onGrabLord={grabLord}
            onPassGrab={passGrab}
          />
        )}
      </AnimatePresence>

      {/* 出牌控制面板 */}
      <AnimatePresence>
        {state.phase === 'playing' && state.currentPlayer !== 'player' && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center">
            <ActionPanel
              currentPlayer={state.currentPlayer}
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
