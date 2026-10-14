import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { groupByRank } from '../engine/utils'
import { compareCardTypes } from '../engine/CardTypes'

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
  ): Card[] | 'pass' {
    if (hand.length === 0) return []

    // 简单AI：只出单张和对子
    const options: CardType[] = []

    for (const card of hand) {
      options.push({ type: 'single', rank: card.rank, cards: [card] })
    }
    for (const [rank, cards] of groupByRank(hand)) {
      if (cards.length >= 2) {
        options.push({ type: 'pair', rank, cards: cards.slice(0, 2) })
      }
    }

    const playable = isFirstPlay || lastCards === null
      ? options
      : options.filter(o => compareCardTypes(o, lastCards) > 0)

    if (playable.length === 0) return 'pass'
    // 随机过牌，增加不确定性
    if (Math.random() < 0.3) return 'pass'

    return playable[Math.floor(Math.random() * playable.length)].cards
  }
}
