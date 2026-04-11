import React from 'react'
import { motion } from 'framer-motion'
import { Card as CardType, Suit } from '../types'
import { getRankName, getSuitSymbol, isRedSuit } from '../engine/utils'

interface CardProps {
  card: CardType
  isSelected?: boolean
  isPlayable?: boolean
  onClick?: () => void
  isSmall?: boolean
}

export function Card({ card, isSelected, isPlayable, onClick, isSmall }: CardProps) {
  const rankName = getRankName(card.rank)
  const suitSymbol = card.isJoker ? '' : getSuitSymbol(card.suit)
  const isRed = isRedSuit(card.suit)

  const scale = isSmall ? 0.6 : 1

  return (
    <motion.div
      whileHover={isPlayable ? { y: -10 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      animate={{ y: isSelected ? -20 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="relative cursor-pointer select-none"
      style={{ scale }}
    >
      {/* 卡牌背景 */}
      <div className={`
        w-16 h-24 rounded-lg shadow-lg overflow-hidden
        bg-white border-2 border-gray-200
        ${card.isJoker ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-white'}
      `}>
        {/* 左上角 */}
        <div className="absolute top-1 left-1 flex flex-col items-center">
          <span className={`text-lg font-bold ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
            {rankName}
          </span>
          <span className={`text-sm ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
            {suitSymbol}
          </span>
        </div>

        {/* 中间大符号 */}
        {card.isJoker ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">
              {card.jokerType === 'big' ? '👑' : '🃏'}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-4xl ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
              {suitSymbol}
            </span>
          </div>
        )}

        {/* 右下角 */}
        <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
          <span className={`text-lg font-bold ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
            {rankName}
          </span>
          <span className={`text-sm ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
            {suitSymbol}
          </span>
        </div>
      </div>

      {/* 选中状态 */}
      {isSelected && (
        <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg" />
      )}
    </motion.div>
  )
}

// 卡牌背面组件
export function CardBack({ isSmall }: { isSmall?: boolean }) {
  const scale = isSmall ? 0.6 : 1

  return (
    <div
      className="w-16 h-24 rounded-lg shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-700"
      style={{ scale }}
    >
      {/* 装饰图案 */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center">
          <span className="text-blue-600 text-2xl">🐕</span>
        </div>
      </div>
    </div>
  )
}
