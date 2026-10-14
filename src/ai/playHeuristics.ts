import { Card, CardType } from '../types'
import { groupByRank } from '../engine/utils'

/** 手牌中构成炸弹的点数（用于避免拆炸弹） */
export function getBombRanks(hand: Card[]): Set<number> {
  const ranks = new Set<number>()
  for (const [rank, cards] of groupByRank(hand)) {
    if (cards.length === 4) ranks.add(rank)
  }
  return ranks
}

/** 从普通组合里选最优：优先多出牌、点数小，且避免拆炸弹 */
export function selectBest(plays: CardType[], bombRanks: Set<number>): CardType {
  let best = plays[0]
  let bestScore = scorePlay(best, bombRanks)
  for (let i = 1; i < plays.length; i++) {
    const s = scorePlay(plays[i], bombRanks)
    if (s < bestScore) {
      bestScore = s
      best = plays[i]
    }
  }
  return best
}

function scorePlay(play: CardType, bombRanks: Set<number>): number {
  let score = 0
  // 出的牌越多越好（尽快出完）
  score -= play.cards.length * 10
  // 点数越小越好（先出小牌 / 刚好压过）
  score += play.rank
  // 拆炸弹惩罚
  if (play.type !== 'bomb' && play.type !== 'rocket') {
    if (play.cards.some(c => bombRanks.has(c.rank))) score += 50
  }
  return score
}

/** 从炸弹组合里选最优：用最小的炸弹，王炸最后 */
export function selectBestBomb(bombs: CardType[]): CardType {
  return bombs.reduce((a, b) => (a.rank < b.rank ? a : b))
}

/** 是否值得出炸弹 */
export function shouldBomb(hand: Card[], lastCards: CardType | null, bombs: CardType[]): boolean {
  // 出完即胜
  if (bombs.some(b => b.cards.length === hand.length)) return true
  // 上家是炸弹，反炸
  if (lastCards?.type === 'bomb') return true
  // 手牌所剩不多，先走
  if (hand.length <= 4) return true
  // 否则保留炸弹
  return false
}
