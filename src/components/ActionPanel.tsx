import React from 'react'
import { motion } from 'framer-motion'
import { PlayerPosition } from '../types'

interface ActionPanelProps {
  currentPlayer: PlayerPosition
}

export function ActionPanel({ currentPlayer }: ActionPanelProps) {
  // Only show waiting during AI turns
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

  // Player turn - let PlayerHand handle buttons
  return null
}
