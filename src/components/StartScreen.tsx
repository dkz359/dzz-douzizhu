import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AIDifficulty } from '../types'
import { useAudio } from '../context/AudioContext'

interface StartScreenProps {
  onStart: (settings: { difficulty: AIDifficulty }) => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal')
  const { isMusicOn, toggleMusic, unlockAndStartMusic } = useAudio()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,.25),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,.2),transparent_40%)]" />
      <button
        onClick={toggleMusic}
        className="absolute top-5 right-5 rounded-full bg-white/15 text-white px-4 py-2 backdrop-blur-md hover:bg-white/25"
      >
        {isMusicOn ? '🔊 音乐开' : '🔇 音乐关'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl text-center rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
      >
        <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-3">
          🐕
        </motion.div>
        <h1 className="text-5xl font-bold text-white mb-2">柴犬斗地主</h1>
        <p className="text-lg text-slate-200 mb-8">Shiba DouDiZhu</p>

        <div className="mb-8">
          <p className="text-lg text-slate-100 mb-4">选择难度</p>
          <div className="flex gap-3 justify-center">
            {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d)}
                className={`px-6 py-2 rounded-full font-bold border transition-colors ${difficulty === d ? 'bg-amber-400 text-slate-900 border-amber-300' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`}
              >
                {d === 'easy' ? '简单' : d === 'normal' ? '普通' : '困难'}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            unlockAndStartMusic()
            onStart({ difficulty })
          }}
          className="px-12 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl rounded-full shadow-xl"
        >
          开始游戏
        </motion.button>
      </motion.div>
    </div>
  )
}
