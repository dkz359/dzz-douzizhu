import { Card, Suit, PlayerPosition } from '../types'

// 创建一副牌
export function createDeck(): Card[] {
  const deck: Card[] = []
  const suits: Suit[] = ['spade', 'heart', 'club', 'diamond']
  const ranks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] // 3到2

  // 四个花色的牌
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: `${suit}-${rank}`, suit, rank })
    }
  }

  // 小王
  deck.push({ id: 'joker-small', suit: 'joker', rank: 16, isJoker: true, jokerType: 'small' })
  // 大王
  deck.push({ id: 'joker-big', suit: 'joker', rank: 17, isJoker: true, jokerType: 'big' })

  return deck
}

// 洗牌
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 发牌给玩家
export function dealCards(deck: Card[], playerCount: number): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => [])
  deck.forEach((card, index) => {
    hands[index % playerCount].push(card)
  })
  return hands
}

// 获取牌的点数名称
export function getRankName(rank: number): string {
  const names: Record<number, string> = {
    3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2', 16: '小王', 17: '大王'
  }
  return names[rank] || ''
}

// 获取花色符号
export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    spade: '♠',
    heart: '♥',
    club: '♣',
    diamond: '♦',
    joker: ''
  }
  return symbols[suit]
}

// 判断是否为红色花色
export function isRedSuit(suit: Suit): boolean {
  return suit === 'heart' || suit === 'diamond'
}

// 按点数分组
export function groupByRank(cards: Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>()
  for (const card of cards) {
    const existing = groups.get(card.rank) || []
    existing.push(card)
    groups.set(card.rank, existing)
  }
  return groups
}

// 按点数排序
export function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.rank - a.rank)
}
