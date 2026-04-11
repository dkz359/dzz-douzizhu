import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { identifyCardType } from '../engine/CardTypes'

export class EasyAI implements IAIStrategy {
  difficulty: AIDifficulty = 'easy'

  decideGrabLord(hand: Card[]): boolean {
    // 简单AI：手牌中有大牌就抢
    const hasBigCards = hand.filter(c => c.rank >= 14).length
    return hasBigCards >= 3 && Math.random() > 0.5
  }

  decidePlayCard(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[] {
    // 随机出牌
    if (hand.length === 0) return []

    if (isFirstPlay || lastCards === null) {
      // 首出：随机出一张
      const shuffled = [...hand].sort(() => Math.random() - 0.5)
      return [shuffled[0]]
    }

    // 随机过牌
    if (Math.random() < 0.3) return 'pass' as unknown as Card[]

    // 随机出一张能打过的牌（只有上家出的是单张才能用单张压过）
    const playable = hand.filter(c => {
      const cardType = identifyCardType([c])
      if (!cardType) return false
      if (lastCards.type !== 'single') return false
      return cardType.rank > lastCards.rank
    })

    if (playable.length > 0) {
      return [playable[Math.floor(Math.random() * playable.length)]]
    }

    return 'pass' as unknown as Card[]
  }
}