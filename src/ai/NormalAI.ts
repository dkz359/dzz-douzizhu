import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { identifyCardType } from '../engine/CardTypes'
import { groupByRank } from '../engine/utils'

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
  ): Card[] {
    if (hand.length === 0) return []

    // 找出所有能出的牌型组合
    const playableCombinations = this.findPlayableCombinations(hand, lastCards, isFirstPlay)

    if (playableCombinations.length === 0) {
      return 'pass' as unknown as Card[]
    }

    // 选择最优的出牌策略
    return this.selectBestPlay(playableCombinations, hand)
  }

  private findPlayableCombinations(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[][] {
    const results: Card[][] = []

    // 尝试单张
    for (const card of hand) {
      if (this.canBeat(card, lastCards, isFirstPlay)) {
        results.push([card])
      }
    }

    // 尝试对子
    const groups = groupByRank(hand)
    for (const [rank, cards] of groups) {
      if (cards.length >= 2) {
        const pair = cards.slice(0, 2)
        if (this.canBeatPair(rank, lastCards, isFirstPlay)) {
          results.push(pair)
        }
      }
    }

    return results
  }

  private canBeat(card: Card, lastCards: CardType | null, isFirstPlay: boolean): boolean {
    if (isFirstPlay || lastCards === null) return true
    if (lastCards.type === 'rocket') return false
    return card.rank > lastCards.rank
  }

  private canBeatPair(rank: number, lastCards: CardType | null, isFirstPlay: boolean): boolean {
    if (isFirstPlay || lastCards === null) return true
    if (lastCards.type !== 'pair') return false
    return rank > lastCards.rank
  }

  private selectBestPlay(combinations: Card[][], _hand: Card[]): Card[] {
    // 选择能最快出完的组合
    // 优先出短顺子、回收单张
    return combinations[0]
  }
}