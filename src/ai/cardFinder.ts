import { Card, CardType } from '../types'
import { groupByRank } from '../engine/utils'
import { compareCardTypes } from '../engine/CardTypes'

/**
 * 从手牌中生成所有合法出牌组合。
 * 供 AI 决策使用，覆盖斗地主全部牌型。
 */
export function findAllPlays(hand: Card[]): CardType[] {
  const plays: CardType[] = []
  plays.push(...findSingles(hand))
  plays.push(...findPairs(hand))
  plays.push(...findTriples(hand))
  plays.push(...findTripleOnes(hand))
  plays.push(...findTripleTwos(hand))
  plays.push(...findStraights(hand))
  plays.push(...findStraightPairs(hand))
  plays.push(...findPlanes(hand))
  plays.push(...findPlaneSingles(hand))
  plays.push(...findPlanePairs(hand))
  plays.push(...findBombs(hand))
  const rocket = findRocket(hand)
  if (rocket) plays.push(rocket)
  return plays
}

/** 从已有组合中筛出能压过上家的 */
export function findBeating(
  plays: CardType[],
  lastCards: CardType | null,
  isFirstPlay: boolean
): CardType[] {
  if (isFirstPlay || lastCards === null) return plays
  return plays.filter(p => compareCardTypes(p, lastCards) > 0)
}

// 单张
function findSingles(hand: Card[]): CardType[] {
  return [...hand]
    .sort((a, b) => b.rank - a.rank)
    .map((c): CardType => ({ type: 'single', rank: c.rank, cards: [c] }))
}

// 对子
function findPairs(hand: Card[]): CardType[] {
  const result: CardType[] = []
  for (const [rank, cards] of groupByRank(hand)) {
    if (cards.length >= 2) result.push({ type: 'pair', rank, cards: cards.slice(0, 2) })
  }
  return result
}

// 三张
function findTriples(hand: Card[]): CardType[] {
  const result: CardType[] = []
  for (const [rank, cards] of groupByRank(hand)) {
    if (cards.length >= 3) result.push({ type: 'triple', rank, cards: cards.slice(0, 3) })
  }
  return result
}

// 三带一
function findTripleOnes(hand: Card[]): CardType[] {
  const result: CardType[] = []
  for (const [rank, cards] of groupByRank(hand)) {
    if (cards.length < 3) continue
    const triple = cards.slice(0, 3)
    // 单张翅膀必须是不同点数的牌
    for (const card of hand) {
      if (card.rank !== rank) {
        result.push({ type: 'triple_one', rank, cards: [...triple, card] })
      }
    }
  }
  return result
}

// 三带二
function findTripleTwos(hand: Card[]): CardType[] {
  const result: CardType[] = []
  const groups = groupByRank(hand)
  for (const [rank, cards] of groups) {
    if (cards.length < 3) continue
    const triple = cards.slice(0, 3)
    for (const [pairRank, pairCards] of groups) {
      if (pairRank === rank || pairCards.length < 2) continue
      result.push({ type: 'triple_two', rank, cards: [...triple, ...pairCards.slice(0, 2)] })
    }
  }
  return result
}

// 找出连续点数的段落（ranks 需已按降序排列）
function findConsecutiveSegments(ranks: number[]): number[][] {
  const segments: number[][] = []
  let i = 0
  while (i < ranks.length) {
    let j = i
    while (j + 1 < ranks.length && ranks[j] === ranks[j + 1] + 1) j++
    segments.push(ranks.slice(i, j + 1))
    i = j + 1
  }
  return segments
}

// 顺子（5 张及以上，不含 2 和王）
function findStraights(hand: Card[]): CardType[] {
  const groups = groupByRank(hand)
  const ranks = [...groups.keys()].filter(r => r < 15).sort((a, b) => b - a)
  const result: CardType[] = []
  for (const seg of findConsecutiveSegments(ranks)) {
    for (let len = 5; len <= seg.length; len++) {
      for (let start = 0; start + len <= seg.length; start++) {
        const segRanks = seg.slice(start, start + len)
        const cards: Card[] = []
        for (const r of segRanks) cards.push(groups.get(r)![0])
        result.push({ type: 'straight', rank: segRanks[0], cards })
      }
    }
  }
  return result
}

// 连对（3 连对及以上，不含 2 和王）
function findStraightPairs(hand: Card[]): CardType[] {
  const groups = groupByRank(hand)
  const ranks = [...groups.entries()]
    .filter(([r, cs]) => r < 15 && cs.length >= 2)
    .map(([r]) => r)
    .sort((a, b) => b - a)
  const result: CardType[] = []
  for (const seg of findConsecutiveSegments(ranks)) {
    for (let len = 3; len <= seg.length; len++) {
      for (let start = 0; start + len <= seg.length; start++) {
        const segRanks = seg.slice(start, start + len)
        const cards: Card[] = []
        for (const r of segRanks) cards.push(...groups.get(r)!.slice(0, 2))
        result.push({ type: 'straight_pair', rank: segRanks[0], cards })
      }
    }
  }
  return result
}

// 飞机（不带翅膀，2 连及以上）
function findPlanes(hand: Card[]): CardType[] {
  const groups = groupByRank(hand)
  const ranks = [...groups.entries()]
    .filter(([r, cs]) => r < 15 && cs.length >= 3)
    .map(([r]) => r)
    .sort((a, b) => b - a)
  const result: CardType[] = []
  for (const seg of findConsecutiveSegments(ranks)) {
    for (let len = 2; len <= seg.length; len++) {
      for (let start = 0; start + len <= seg.length; start++) {
        const segRanks = seg.slice(start, start + len)
        const cards: Card[] = []
        for (const r of segRanks) cards.push(...groups.get(r)!.slice(0, 3))
        result.push({ type: 'plane', rank: segRanks[0], cards })
      }
    }
  }
  return result
}

// 飞机带单翅膀（翅膀用点数最小的单张）
function findPlaneSingles(hand: Card[]): CardType[] {
  const groups = groupByRank(hand)
  const tripleRanks = [...groups.entries()]
    .filter(([r, cs]) => r < 15 && cs.length >= 3)
    .map(([r]) => r)
    .sort((a, b) => b - a)
  const result: CardType[] = []
  for (const seg of findConsecutiveSegments(tripleRanks)) {
    for (let len = 2; len <= seg.length; len++) {
      for (let start = 0; start + len <= seg.length; start++) {
        const segRanks = seg.slice(start, start + len)
        const tripleCards: Card[] = []
        for (const r of segRanks) tripleCards.push(...groups.get(r)!.slice(0, 3))
        const tripleIds = new Set(tripleCards.map(c => c.id))
        const remaining = hand.filter(c => !tripleIds.has(c.id))
        // 翅膀必须是不同点数的单张，取点数最小的
        const kickerRanks = [...new Set(remaining.map(c => c.rank))].sort((a, b) => a - b)
        if (kickerRanks.length < len) continue
        const kickers: Card[] = []
        for (const r of kickerRanks.slice(0, len)) {
          kickers.push(remaining.find(c => c.rank === r)!)
        }
        result.push({ type: 'plane_single', rank: segRanks[0], cards: [...tripleCards, ...kickers] })
      }
    }
  }
  return result
}

// 飞机带对翅膀（翅膀用点数最小的对子）
function findPlanePairs(hand: Card[]): CardType[] {
  const groups = groupByRank(hand)
  const tripleRanks = [...groups.entries()]
    .filter(([r, cs]) => r < 15 && cs.length >= 3)
    .map(([r]) => r)
    .sort((a, b) => b - a)
  const result: CardType[] = []
  for (const seg of findConsecutiveSegments(tripleRanks)) {
    for (let len = 2; len <= seg.length; len++) {
      for (let start = 0; start + len <= seg.length; start++) {
        const segRanks = seg.slice(start, start + len)
        const tripleCards: Card[] = []
        for (const r of segRanks) tripleCards.push(...groups.get(r)!.slice(0, 3))
        const tripleIds = new Set(tripleCards.map(c => c.id))
        const remainingGroups = groupByRank(hand.filter(c => !tripleIds.has(c.id)))
        const pairRanks = [...remainingGroups.entries()]
          .filter(([, cs]) => cs.length >= 2)
          .map(([r]) => r)
          .sort((a, b) => a - b)
        if (pairRanks.length < len) continue
        const kickers: Card[] = []
        for (const r of pairRanks.slice(0, len)) {
          kickers.push(...remainingGroups.get(r)!.slice(0, 2))
        }
        result.push({ type: 'plane_pair', rank: segRanks[0], cards: [...tripleCards, ...kickers] })
      }
    }
  }
  return result
}

// 炸弹
function findBombs(hand: Card[]): CardType[] {
  const result: CardType[] = []
  for (const [rank, cards] of groupByRank(hand)) {
    if (cards.length === 4) result.push({ type: 'bomb', rank, cards: [...cards] })
  }
  return result
}

// 王炸
function findRocket(hand: Card[]): CardType | null {
  const jokers = hand.filter(c => c.isJoker)
  if (jokers.length === 2) {
    return { type: 'rocket', rank: 100, cards: jokers }
  }
  return null
}
