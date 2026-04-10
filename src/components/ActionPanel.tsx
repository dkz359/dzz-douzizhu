import React from 'react'
import { motion } from 'framer-motion'
import { PlayerPosition } from '../types'

interface ActionPanelProps {
  currentPlayer: PlayerPosition
  onPass: (position: PlayerPosition) => void
  canPass: boolean
}

export function ActionPanel({ currentPlayer, onPass, canPass }: ActionPanelProps) {
  if (currentPlayer !== 'player') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-white/90 rounded-full px-6 py-3 shadow-lg"
        >
          <span className="text-shiba-dark font-bold">等待其他人出牌...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center gap-4"
    >
      {canPass && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPass('player')}
          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-lg"
        >
          不出
        </motion.button>
      )}
    </motion.div>
  )
}
