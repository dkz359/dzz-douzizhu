import React from 'react'
import { motion } from 'framer-motion'
import { Player, GamePhase } from '../types'
import { CardBack } from './Card'

interface AIPlayerProps {
  player: Player
  isCurrentPlayer: boolean
  isLord: boolean
  position: 'left' | 'right'
  grabStatus?: 'none' | 'grabbed' | 'passed'
  gamePhase?: GamePhase
}

export function AIPlayer({ player, isCurrentPlayer, isLord, position, grabStatus, gamePhase }: AIPlayerProps) {
  const positionClass = position === 'left'
    ? 'absolute left-8 top-8'
    : 'absolute right-8 top-8'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        ${positionClass}
        flex flex-col items-center gap-2
        ${isCurrentPlayer ? 'ring-4 ring-yellow-400 ring-opacity-70 rounded-xl' : ''}
      `}
    >
      {/* 头像 */}
      <div className={`
        w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-3xl
        border-4 ${isLord ? 'border-yellow-400' : 'border-orange-300'}
        ${isCurrentPlayer ? 'animate-pulse' : ''}
      `}>
        🐕
      </div>

      {/* 名字 */}
      <div className="text-center relative">
        <div className="text-white font-bold text-sm drop-shadow-lg">
          {player.name}
        </div>
        {isLord ? (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            地主
          </div>
        ) : gamePhase === 'playing' ? (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
            农民
          </div>
        ) : null}
      </div>

      {/* 手牌数量 */}
      <div className="flex gap-1">
        {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <CardBack isSmall />
          </motion.div>
        ))}
        {player.hand.length > 5 && (
          <div className="text-white text-sm">+{player.hand.length - 5}</div>
        )}
      </div>

      {/* Grab status indicators */}
      {grabStatus === 'grabbed' && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-1 rounded-full shadow">
          已抢
        </div>
      )}
      {grabStatus === 'passed' && (
        <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-1 rounded-full">
          不抢
        </div>
      )}
    </motion.div>
  )
}
