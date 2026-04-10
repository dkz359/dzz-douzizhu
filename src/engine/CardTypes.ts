import { Card, CardType, CardTypeName } from '../types'

// 按点数分组
function groupByRank(cards: Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>()
  for (const card of cards) {
    const existing = groups.get(card.rank) || []
    existing.push(card)
    groups.set(card.rank, existing)
  }
  return groups
}

// 按点数排序
function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.rank - a.rank)
}

// 判断单张
function isSingle(cards: Card[]): CardType | null {
  if (cards.length !== 1) return null
  return { type: 'single', rank: cards[0].rank, cards }
}

// 判断对子
function isPair(cards: Card[]): CardType | null {
  if (cards.length !== 2) return null
  const sorted = sortByRank(cards)
  if (sorted[0].rank !== sorted[1].rank) return null
  return { type: 'pair', rank: sorted[0].rank, cards }
}

// 判断三张
function isTriple(cards: Card[]): CardType | null {
  if (cards.length !== 3) return null
  const sorted = sortByRank(cards)
  if (sorted[0].rank !== sorted[2].rank) return null
  return { type: 'triple', rank: sorted[0].rank, cards }
}

// 判断三带一
function isTripleOne(cards: Card[]): CardType | null {
  if (cards.length !== 4) return null
  const groups = groupByRank(cards)
  const keys = Array.from(groups.keys())

  // 找到三张的组
  for (const rank of keys) {
    if (groups.get(rank)!.length === 3) {
      return { type: 'triple_one', rank, cards }
    }
  }
  return null
}

// 判断三带二
function isTripleTwo(cards: Card[]): CardType | null {
  if (cards.length !== 5) return null
  const groups = groupByRank(cards)
  const keys = Array.from(groups.keys())

  // 找到三张的组
  for (const rank of keys) {
    if (groups.get(rank)!.length === 3) {
      // 检查剩下的两张是否是对子
      const remaining = cards.filter(c => c.rank !== rank)
      if (remaining.length === 2 && remaining[0].rank === remaining[1].rank) {
        return { type: 'triple_two', rank, cards }
      }
    }
  }
  return null
}

// 判断顺子
function isStraight(cards: Card[]): CardType | null {
  if (cards.length < 5) return null
  const sorted = sortByRank(cards)

  // 不能有2和王
  if (sorted.some(c => c.rank >= 15)) return null

  // 检查是否连续
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].rank !== sorted[i + 1].rank + 1) return null
  }

  return { type: 'straight', rank: sorted[0].rank, cards }
}

// 判断连对
function isStraightPair(cards: Card[]): CardType | null {
  if (cards.length < 6 || cards.length % 2 !== 0) return null
  const sorted = sortByRank(cards)

  // 不能有2和王
  if (sorted.some(c => c.rank >= 15)) return null

  const pairCount = cards.length / 2
  // 检查每对是否相同
  for (let i = 0; i < pairCount; i++) {
    if (sorted[i * 2].rank !== sorted[i * 2 + 1].rank) return null
  }
  // 检查是否连续
  for (let i = 0; i < pairCount - 1; i++) {
    if (sorted[i * 2].rank !== sorted[(i + 1) * 2].rank + 1) return null
  }

  return { type: 'straight_pair', rank: sorted[0].rank, cards }
}

// 判断飞机（不带翅膀）
function isPlane(cards: Card[]): CardType | null {
  if (cards.length < 6 || cards.length % 3 !== 0) return null
  const sorted = sortByRank(cards)

  // 不能有2和王
  if (sorted.some(c => c.rank >= 15)) return null

  const tripleCount = cards.length / 3
  // 检查每个三张是否相同
  for (let i = 0; i < tripleCount; i++) {
    const triple = sorted.slice(i * 3, i * 3 + 3)
    if (triple[0].rank !== triple[1].rank || triple[1].rank !== triple[2].rank) {
      return null
    }
  }
  // 检查是否连续
  for (let i = 0; i < tripleCount - 1; i++) {
    const currentTripleRank = sorted[i * 3].rank
    const nextTripleRank = sorted[(i + 1) * 3].rank
    if (currentTripleRank !== nextTripleRank + 1) return null
  }

  return { type: 'plane', rank: sorted[0].rank, cards }
}

// 判断飞机带单翅膀
function isPlaneSingle(cards: Card[]): CardType | null {
  const tripleCount = Math.floor(cards.length / 4) // 每4张包含一个三张和一个单张
  if (tripleCount < 2) return null

  const triples: number[] = []
  const singles: Card[] = []
  const groups = groupByRank(cards)

  // 找出所有的三张
  for (const [rank, groupCards] of groups) {
    if (groupCards.length === 3) {
      triples.push(rank)
    } else if (groupCards.length === 1) {
      singles.push(groupCards[0])
    }
  }

  if (triples.length !== tripleCount || singles.length !== tripleCount) {
    return null
  }

  // 检查三张是否连续
  triples.sort((a, b) => b - a)
  for (let i = 0; i < triples.length - 1; i++) {
    if (triples[i] !== triples[i + 1] + 1) return null
  }

  // 不能有2和王
  if (triples.some(r => r >= 15)) return null

  return { type: 'plane_single', rank: triples[0], cards }
}

// 判断飞机带对翅膀
function isPlanePair(cards: Card[]): CardType | null {
  const tripleCount = Math.floor(cards.length / 5) // 每5张包含一个三张和一个对子
  if (tripleCount < 2) return null

  const triples: number[] = []
  const pairs: number[] = []
  const groups = groupByRank(cards)

  for (const [rank, groupCards] of groups) {
    if (groupCards.length === 3) {
      triples.push(rank)
    } else if (groupCards.length === 2) {
      pairs.push(rank)
    }
  }

  if (triples.length !== tripleCount || pairs.length !== tripleCount) {
    return null
  }

  // 检查三张是否连续
  triples.sort((a, b) => b - a)
  for (let i = 0; i < triples.length - 1; i++) {
    if (triples[i] !== triples[i + 1] + 1) return null
  }

  // 不能有2和王
  if (triples.some(r => r >= 15)) return null

  return { type: 'plane_pair', rank: triples[0], cards }
}

// 判断炸弹
function isBomb(cards: Card[]): CardType | null {
  if (cards.length !== 4) return null
  const sorted = sortByRank(cards)
  if (sorted[0].rank !== sorted[3].rank) return null
  return { type: 'bomb', rank: sorted[0].rank, cards }
}

// 判断王炸
function isRocket(cards: Card[]): CardType | null {
  if (cards.length !== 2) return null
  const sorted = sortByRank(cards)
  if (sorted[0].jokerType === 'big' && sorted[1].jokerType === 'small') {
    return { type: 'rocket', rank: 100, cards } // 王炸最大
  }
  return null
}

// 识别牌型
export function identifyCardType(cards: Card[]): CardType | null {
  if (cards.length === 0) return null

  // 按长度尝试匹配（从特殊到普通）
  return isRocket(cards)
    || isBomb(cards)
    || isPlanePair(cards)
    || isPlaneSingle(cards)
    || isPlane(cards)
    || isStraightPair(cards)
    || isStraight(cards)
    || isTripleTwo(cards)
    || isTripleOne(cards)
    || isTriple(cards)
    || isPair(cards)
    || isSingle(cards)
}

// 比较两个牌型的大小
export function compareCardTypes(a: CardType, b: CardType): number {
  // 王炸最大
  if (a.type === 'rocket') return 1
  if (b.type === 'rocket') return -1

  // 炸弹
  if (a.type === 'bomb' && b.type !== 'bomb') return 1
  if (a.type !== 'bomb' && b.type === 'bomb') return -1
  if (a.type === 'bomb' && b.type === 'bomb') {
    return a.rank - b.rank // 炸弹比较等级
  }

  // 牌型必须相同才能比较
  if (a.type !== b.type) return 0
  if (a.cards.length !== b.cards.length) return 0

  // 比较等级
  return a.rank - b.rank
}

// 检查牌型是否有效
export function isValidCardType(cards: Card[]): boolean {
  return identifyCardType(cards) !== null
}
