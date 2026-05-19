import { Card, CardType, GameState, GameAction, Player, PlayerPosition } from '../types'
import { createDeck, shuffleDeck } from './utils'
import { identifyCardType, compareCardTypes } from './CardTypes'

// 初始玩家状态
function createInitialPlayers(): Player[] {
  return [
    { id: 'player', position: 'player', name: '你', hand: [], isLord: false },
    { id: 'ai1', position: 'ai1', name: '柴犬小明', hand: [], isLord: false },
    { id: 'ai2', position: 'ai2', name: '柴犬小红', hand: [], isLord: false },
  ]
}

// 初始游戏状态
export function createInitialState(): GameState {
  return {
    phase: 'idle',
    players: createInitialPlayers(),
    lordPosition: null,
    deck: [],
    bottomCards: [],
    currentPlayer: 'player',
    lastPlayedCards: null,
    lastPlayedPlayer: null,
    winner: null,
    settings: { difficulty: 'normal' },
    firstGrabber: null,
    lastGrabber: null,
    grabDecisions: { player: 'none', ai1: 'none', ai2: 'none' },
    grabPassCount: 0,
    roundPlayedCards: { player: null, ai1: null, ai2: null },
    regrabAfterFirst: false,
  }
}

// 游戏状态 reducer
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      // 创建并洗牌
      const deck = shuffleDeck(createDeck())
      // 发牌：每人17张
      const playerCards = deck.slice(0, 17)
      const ai1Cards = deck.slice(17, 34)
      const ai2Cards = deck.slice(34, 51)
      const bottomCards = deck.slice(51, 54)

      const positions: PlayerPosition[] = ['player', 'ai1', 'ai2']
      const randomStart = positions[Math.floor(Math.random() * 3)]

      return {
        ...state,
        phase: 'dealing',
        settings: action.settings,
        players: [
          { ...state.players[0], hand: playerCards, isLord: false },
          { ...state.players[1], hand: ai1Cards, isLord: false },
          { ...state.players[2], hand: ai2Cards, isLord: false },
        ],
        deck: [],
        bottomCards,
        lordPosition: null,
        currentPlayer: randomStart,
        lastPlayedCards: null,
        lastPlayedPlayer: null,
        winner: null,
        firstGrabber: null,
        lastGrabber: null,
        grabDecisions: { player: 'none', ai1: 'none', ai2: 'none' },
        grabPassCount: 0,
        roundPlayedCards: { player: null, ai1: null, ai2: null },
        regrabAfterFirst: false,
      }
    }

    case 'DEAL_CARDS': {
      return { ...state, phase: 'grabbing_lord' }
    }

    case 'PLAY_CARDS': {
      const { position, cards } = action
      const playerIndex = state.players.findIndex(p => p.position === position)
      const player = state.players[playerIndex]

      // 找出出的牌
      const newHand = player.hand.filter(c => !cards.some(pc => pc.id === c.id))
      const cardType = identifyCardType(cards)!

      // 检查是否出完了
      const isWin = newHand.length === 0

      const updatedPlayers = [...state.players]
      updatedPlayers[playerIndex] = { ...player, hand: newHand }

      const nextPlayer = getNextPlayer(position, state.players.map(p => p.position))

      // 轮到下一个玩家出牌时，先清空他的出牌区域（因为还没选择出不出）
      const newRoundPlayedCards = { ...state.roundPlayedCards }
      newRoundPlayedCards[nextPlayer] = null
      newRoundPlayedCards[position] = cards

      return {
        ...state,
        players: updatedPlayers,
        roundPlayedCards: newRoundPlayedCards,
        lastPlayedCards: cardType,
        lastPlayedPlayer: position,
        currentPlayer: nextPlayer,
        winner: isWin ? position : null,
        phase: isWin ? 'game_over' : state.phase,
      }
    }

    case 'PASS': {
      const nextPlayer = getNextPlayer(state.currentPlayer, state.players.map(p => p.position))

      // 如果回到出牌者（一轮结束），清除本轮出牌记录
      if (state.lastPlayedPlayer && nextPlayer === state.lastPlayedPlayer) {
        return {
          ...state,
          roundPlayedCards: { player: null, ai1: null, ai2: null },
          lastPlayedCards: null,
          lastPlayedPlayer: null,
          currentPlayer: nextPlayer,
        }
      }

      // 设置当前玩家选择不出（用空数组表示）
      const newRoundPlayedCards = { ...state.roundPlayedCards }
      newRoundPlayedCards[state.currentPlayer] = []
      // 清空下一个玩家的出牌区域（因为还没选择出不出）
      newRoundPlayedCards[nextPlayer] = null

      return {
        ...state,
        roundPlayedCards: newRoundPlayedCards,
        currentPlayer: nextPlayer,
      }
    }

    case 'GRAB_LORD': {
      if (action.position !== state.currentPlayer) return state

      // 如果已经选择过"不抢"，不能再抢
      if (state.grabDecisions[action.position] === 'passed') return state

      const positions = state.players.map(p => p.position)
      const nextPlayer = getNextPlayer(state.currentPlayer, positions)
      const newGrabDecisions = {
        ...state.grabDecisions,
        [action.position]: 'grabbed' as const
      }

      if (state.currentPlayer === state.firstGrabber && state.regrabAfterFirst) {
        return { ...confirmLord(state, state.currentPlayer), grabDecisions: newGrabDecisions }
      }

      // 如果回到 firstGrabber（第一轮的情况）
      if (nextPlayer === state.firstGrabber) {
        // 如果是其他人抢后轮到 firstGrabber → 只更新状态，不确认，等 firstGrabber 决策
        return {
          ...state,
          grabDecisions: newGrabDecisions,
          lastGrabber: state.currentPlayer,
          currentPlayer: nextPlayer,
          regrabAfterFirst: true,
        }
      }

      // 正常抢地主流程
      const isFirstGrab = state.firstGrabber === null

      return {
        ...state,
        grabDecisions: newGrabDecisions,
        firstGrabber: isFirstGrab ? state.currentPlayer : state.firstGrabber,
        lastGrabber: state.currentPlayer,
        currentPlayer: nextPlayer,
        regrabAfterFirst: !isFirstGrab ? true : state.regrabAfterFirst,
      }
    }

    case 'PASS_GRAB': {
      if (action.position !== state.currentPlayer) return state

      const positions = state.players.map(p => p.position)
      const nextPlayer = getNextPlayer(state.currentPlayer, positions)
      const isRoundEnd = nextPlayer === state.firstGrabber

      const newGrabDecisions = {
        ...state.grabDecisions,
        [action.position]: 'passed' as const
      }

      if (state.currentPlayer === state.firstGrabber && state.regrabAfterFirst) {
        return { ...confirmLord(state, state.lastGrabber ?? state.firstGrabber), grabDecisions: newGrabDecisions }
      }

      if (state.firstGrabber === null) {
        const newPassCount = (state.grabPassCount || 0) + 1
        if (newPassCount >= 3) {
          // All players passed without anyone grabbing - restart dealing
          const positions: PlayerPosition[] = ['player', 'ai1', 'ai2']
          return {
            ...state,
            grabDecisions: { player: 'none', ai1: 'none', ai2: 'none' },
            grabPassCount: 0,
            currentPlayer: positions[Math.floor(Math.random() * 3)],
          }
        }
        return {
          ...state,
          grabDecisions: newGrabDecisions,
          grabPassCount: newPassCount,
          currentPlayer: nextPlayer,
        }
      }

      if (isRoundEnd) {
        // 如果 B 或 C 在第一轮抢过，firstGrabber 获得第二次机会
        if (state.regrabAfterFirst) {
          return {
            ...state,
            grabDecisions: newGrabDecisions,
            currentPlayer: nextPlayer,
          }
        }
        // 否则（B、C 都过），firstGrabber 自动成为地主
        return { ...confirmLord(state, state.firstGrabber), grabDecisions: newGrabDecisions }
      }

      return {
        ...state,
        grabDecisions: newGrabDecisions,
        currentPlayer: nextPlayer,
      }
    }

    case 'RESET_GAME': {
      return createInitialState()
    }

    default:
      return state
  }
}

// 获取下一个玩家
function getNextPlayer(current: PlayerPosition, positions: PlayerPosition[]): PlayerPosition {
  const index = positions.indexOf(current)
  return positions[(index + 1) % positions.length]
}

// 确认地主
function confirmLord(state: GameState, lordPos: PlayerPosition): GameState {
  const updatedPlayers = state.players.map(p => ({
    ...p,
    isLord: p.position === lordPos,
    hand: p.position === lordPos ? [...p.hand, ...state.bottomCards] : p.hand
  }))
  return {
    ...state,
    phase: 'playing',
    players: updatedPlayers,
    lordPosition: lordPos,
    currentPlayer: lordPos,
    firstGrabber: null,
    lastGrabber: null,
    grabDecisions: { player: 'none', ai1: 'none', ai2: 'none' },
    grabPassCount: 0,
    roundPlayedCards: { player: null, ai1: null, ai2: null },
    regrabAfterFirst: false,
  }
}

// 检查是否可以出牌
export function canPlayCards(
  cards: Card[],
  lastCards: CardType | null,
  isFirstPlay: boolean
): boolean {
  const cardType = identifyCardType(cards)
  if (!cardType) return false

  // 首出可以出任何合法牌型
  if (isFirstPlay || lastCards === null) return true

  // 王炸可以打一切
  if (cardType.type === 'rocket') return true

  // 炸弹可以打非炸弹
  if (cardType.type === 'bomb' && lastCards.type !== 'bomb') return true
  if (cardType.type === 'bomb' && lastCards.type === 'bomb') {
    return cardType.rank > lastCards.rank
  }

  // 同牌型比较
  if (cardType.type !== lastCards.type) return false
  if (cardType.cards.length !== lastCards.cards.length) return false

  return cardType.rank > lastCards.rank
}

// 判断胜负
export function determineWinner(state: GameState): PlayerPosition | null {
  const lord = state.players.find(p => p.position === state.lordPosition)
  const farmers = state.players.filter(p => p.position !== state.lordPosition)

  // 地主赢了
  if (lord && lord.hand.length === 0) return state.lordPosition
  // 农民赢了（任意一个农民出完）
  if (farmers.some(f => f.hand.length === 0)) {
    return farmers.find(f => f.hand.length === 0)!.position
  }

  return null
}
