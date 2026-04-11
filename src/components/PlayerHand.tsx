import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card as CardType } from '../types'
import { Card } from './Card'
import { sortByRank } from '../engine/utils'

interface PlayerHandProps {
  cards: CardType[]
  isCurrentPlayer: boolean
  onPlayCards: (cards: CardType[]) => void
  isFirstPlay: boolean
  canPass?: boolean
  onPass?: () => void
}

export function PlayerHand({
  cards,
  isCurrentPlayer,
  onPlayCards,
  isFirstPlay,
  canPass,
  onPass
}: PlayerHandProps) {
  const [selectedCards, setSelectedCards] = useState<CardType[]>([])

  // 排序手牌
  const sortedCards = useMemo(() => sortByRank(cards), [cards])

  const handleCardClick = (card: CardType) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(c => c.id === card.id)
      if (isSelected) {
        return prev.filter(c => c.id !== card.id)
      } else {
        return [...prev, card]
      }
    })
  }

  const handlePlay = () => {
    if (selectedCards.length > 0) {
      onPlayCards(selectedCards)
      setSelectedCards([])
    }
  }

  const isSelected = (card: CardType) => selectedCards.some(c => c.id === card.id)

  return (
    <div className="flex flex-col items-center">
      {/* 出牌按钮 - 在手牌上方 */}
      {isCurrentPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex gap-4 justify-center"
        >
          {canPass && (
            <button
              onClick={onPass}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-lg"
            >
              不出
            </button>
          )}
          {selectedCards.length > 0 && (
            <button
              onClick={handlePlay}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-shiba-dark font-bold rounded-full shadow-lg"
            >
              出牌 ({selectedCards.length}张)
            </button>
          )}
        </motion.div>
      )}

      {/* 手牌 */}
      <div className="flex justify-center gap-1 px-4 py-2 bg-green-800/50 rounded-t-xl">
        {sortedCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
            style={{ marginLeft: index === 0 ? 0 : -12 }}
          >
            <Card
              card={card}
              isSelected={isSelected(card)}
              isPlayable={isCurrentPlayer}
              onClick={() => handleCardClick(card)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
