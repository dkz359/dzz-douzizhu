import React from 'react'
import { motion } from 'framer-motion'
import { PlayerPosition } from '../types'

interface LandLordPanelProps {
  currentPlayer: PlayerPosition
  grabDecision: 'none' | 'grabbed' | 'passed'
  onGrabLord: (position: PlayerPosition) => void
  onPassGrab: (position: PlayerPosition) => void
}

export function LandLordPanel({ currentPlayer, grabDecision, onGrabLord, onPassGrab }: LandLordPanelProps) {
  // 如果玩家已经决定过（抢或过），不显示操作面板
  if (grabDecision !== 'none') {
    return null
  }

  if (currentPlayer === 'player') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/30"
      >
        <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          <h3 className="text-xl font-bold text-center text-shiba-dark">叫地主</h3>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGrabLord('player')}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-shiba-dark font-bold rounded-full shadow-lg"
            >
              抢地主
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPassGrab('player')}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-lg"
            >
              不抢
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="bg-white/90 rounded-full px-6 py-3 shadow-lg"
      >
        <span className="text-shiba-dark font-bold">
          等待{currentPlayer === 'ai1' ? '柴犬小明' : '柴犬小红'}叫地主...
        </span>
      </motion.div>
    </div>
  )
}
