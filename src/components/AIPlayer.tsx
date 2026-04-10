import React from 'react'
import { motion } from 'framer-motion'
import { Player } from '../types'
import { CardBack } from './Card'

interface AIPlayerProps {
  player: Player
  isCurrentPlayer: boolean
  isLord: boolean
  position: 'left' | 'right'
}

export function AIPlayer({ player, isCurrentPlayer, isLord, position }: AIPlayerProps) {
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
      <div className="text-center">
        <div className="text-white font-bold text-sm drop-shadow-lg">
          {player.name}
        </div>
        {isLord && (
          <div className="text-yellow-400 text-xs">地主</div>
        )}
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
    </motion.div>
  )
}
