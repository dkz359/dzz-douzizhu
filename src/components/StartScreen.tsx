import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AIDifficulty } from '../types'

interface StartScreenProps {
  onStart: (settings: { difficulty: AIDifficulty }) => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* 标题 */}
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          🐕
        </motion.div>
        <h1 className="text-6xl font-bold text-shiba-dark mb-2">柴犬斗地主</h1>
        <p className="text-xl text-shiba-brown mb-8">Shiba DouDiZhu</p>

        {/* 难度选择 */}
        <div className="mb-8">
          <p className="text-lg text-shiba-dark mb-4">选择难度</p>
          <div className="flex gap-4 justify-center">
            {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d)}
                className={`
                  px-6 py-3 rounded-full font-bold shadow-lg transition-colors
                  ${difficulty === d
                    ? 'bg-yellow-400 text-shiba-dark'
                    : 'bg-white text-gray-600 hover:bg-gray-100'}
                `}
              >
                {d === 'easy' ? '简单' : d === 'normal' ? '普通' : '困难'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 开始按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onStart({ difficulty })}
          className="px-12 py-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold text-xl rounded-full shadow-xl"
        >
          开始游戏
        </motion.button>
      </motion.div>
    </div>
  )
}
