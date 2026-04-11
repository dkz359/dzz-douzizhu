import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerPosition } from '../types'

interface ResultModalProps {
  winner: PlayerPosition | null
  isLordWin: boolean
  onPlayAgain: () => void
  onExit: () => void
}

export function ResultModal({ winner, isLordWin, onPlayAgain, onExit }: ResultModalProps) {
  const isPlayerWin = winner === 'player'

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
          >
            {/* 结果表情 */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              {isPlayerWin ? '🎉' : '😢'}
            </motion.div>

            {/* 结果文字 */}
            <h2 className={`text-4xl font-bold mb-2 ${isPlayerWin ? 'text-yellow-500' : 'text-gray-500'}`}>
              {isPlayerWin ? '胜利！' : '失败'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isLordWin ? '地主获胜' : '农民获胜'}
            </p>

            {/* 按钮 */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayAgain}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-shiba-dark font-bold rounded-full shadow-lg"
              >
                再来一局
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full shadow-lg"
              >
                退出
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
