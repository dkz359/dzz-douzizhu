import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { groupByRank } from '../engine/utils'
import { findAllPlays, findBeating } from './cardFinder'
import { getBombRanks, selectBest, selectBestBomb, shouldBomb } from './playHeuristics'

export class NormalAI implements IAIStrategy {
  difficulty: AIDifficulty = 'normal'

  decideGrabLord(hand: Card[]): boolean {
    // 计算手牌实力
    let score = 0
    for (const card of hand) {
      if (card.rank >= 14) score += 3 // A
      if (card.rank >= 15) score += 5 // 2
      if (card.isJoker) score += 10 // 王
    }

    // 有炸弹加分
    const groups = groupByRank(hand)
    for (const [, cards] of groups) {
      if (cards.length === 4) score += 10
    }

    return score >= 15
  }

  decidePlayCard(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[] | 'pass' {
    if (hand.length === 0) return []

    const plays = findAllPlays(hand)
    const bombRanks = getBombRanks(hand)

    // 普通牌型优先
    const normal = plays.filter(p => p.type !== 'bomb' && p.type !== 'rocket')
    const beatingNormal = findBeating(normal, lastCards, isFirstPlay)
    if (beatingNormal.length > 0) {
      return selectBest(beatingNormal, bombRanks).cards
    }

    // 普通牌压不过，考虑炸弹
    const bombs = plays.filter(p => p.type === 'bomb' || p.type === 'rocket')
    const beatingBombs = findBeating(bombs, lastCards, isFirstPlay)
    if (beatingBombs.length > 0 && shouldBomb(hand, lastCards, beatingBombs)) {
      return selectBestBomb(beatingBombs).cards
    }

    return 'pass'
  }
}
