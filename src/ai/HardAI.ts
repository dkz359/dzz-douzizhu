import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { identifyCardType } from '../engine/CardTypes'
import { groupByRank } from '../engine/utils'

export class HardAI implements IAIStrategy {
  difficulty: AIDifficulty = 'hard'

  private _rememberdCards: Card[] = [] // 记牌器

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
  ): Card[] {
    if (hand.length === 0) return []

    // 困难AI：更智能的出牌
    // 1. 记牌
    this.updateMemory(hand)

    // 2. 分析剩余大牌
    // 3. 配合农民
    // 4. 读牌

    const combinations = this.findSmartPlays(hand, lastCards, isFirstPlay)

    if (combinations.length === 0) {
      return 'pass' as unknown as Card[]
    }

    return this.selectSmartPlay(combinations, hand, lastCards)
  }

  private updateMemory(_playedCards: Card[]): void {
    // 简化版记牌
  }

  private findSmartPlays(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[][] {
    // 找所有能出的牌
    const results: Card[][] = []

    // 单张
    for (const card of hand) {
      if (this.canBeatCard(card, lastCards, isFirstPlay)) {
        results.push([card])
      }
    }

    // 对子
    const groups = groupByRank(hand)
    for (const [rank, cards] of groups) {
      if (cards.length >= 2) {
        if (this.canBeatPair(rank, lastCards, isFirstPlay)) {
          results.push(cards.slice(0, 2))
        }
      }
    }

    // 三张
    for (const [rank, cards] of groups) {
      if (cards.length >= 3) {
        if (this.canBeatTriple(rank, lastCards, isFirstPlay)) {
          results.push(cards.slice(0, 3))
        }
      }
    }

    return results
  }

  private canBeatCard(card: Card, lastCards: CardType | null, isFirstPlay: boolean): boolean {
    if (isFirstPlay || lastCards === null) return true
    if (lastCards.type === 'rocket') return false
    if (lastCards.type === 'bomb') return card.rank > lastCards.rank
    if (lastCards.type !== 'single') return false
    return card.rank > lastCards.rank
  }

  private canBeatPair(rank: number, lastCards: CardType | null, isFirstPlay: boolean): boolean {
    if (isFirstPlay || lastCards === null) return true
    if (lastCards.type !== 'pair') return false
    return rank > lastCards.rank
  }

  private canBeatTriple(rank: number, lastCards: CardType | null, isFirstPlay: boolean): boolean {
    if (isFirstPlay || lastCards === null) return true
    if (lastCards.type !== 'triple') return false
    return rank > lastCards.rank
  }

  private selectSmartPlay(
    combinations: Card[][],
    _hand: Card[],
    _lastCards: CardType | null
  ): Card[] {
    // 优先出能回收的单张
    // 避免送地主
    // 选择对团队最有利的出牌
    return combinations[0]
  }
}