import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { groupByRank } from '../engine/utils'
import { findAllPlays, findBeating } from './cardFinder'
import { getBombRanks, selectBest, selectBestBomb, shouldBomb } from './playHeuristics'

export class HardAI implements IAIStrategy {
  difficulty: AIDifficulty = 'hard'

  decideGrabLord(hand: Card[]): boolean {
    // 高端AI：评估手牌质量
    let score = 0
    const groups = groupByRank(hand)

    for (const [rank, cards] of groups) {
      // 大小王
      if (cards[0].isJoker) score += 15
      // 2
      else if (rank === 15) score += 6
      // A
      else if (rank === 14) score += 4
    }

    // 炸弹
    for (const [, cards] of groups) {
      if (cards.length === 4) score += 8
    }

    // 对子多
    const pairs = Array.from(groups.values()).filter(c => c.length >= 2).length
    score += pairs * 2

    return score >= 20 || (hand.some(c => c.isJoker) && hand.some(c => c.rank === 15))
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
