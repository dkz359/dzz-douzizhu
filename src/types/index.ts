// 牌的花色
export type Suit = 'spade' | 'heart' | 'club' | 'diamond' | 'joker'
export type JokerType = 'small' | 'big'

// 卡牌
export interface Card {
  id: string
  suit: Suit
  rank: number // 3=3, 4=4, ..., 10=10, J=11, Q=12, K=13, A=14, 2=15, joker_small=16, joker_big=17
  isJoker?: boolean
  jokerType?: JokerType
}

// 玩家位置
export type PlayerPosition = 'player' | 'ai1' | 'ai2'

// 玩家信息
export interface Player {
  id: string
  position: PlayerPosition
  name: string
  hand: Card[]
  isLord: boolean
}

// 牌型
export type CardTypeName =
  | 'single'      // 单张
  | 'pair'        // 对子
  | 'triple'      // 三张
  | 'triple_one'  // 三带一
  | 'triple_two'  // 三带二
  | 'straight'    // 顺子
  | 'straight_pair' // 连对
  | 'plane'       // 飞机
  | 'plane_single' // 飞机带单翅膀
  | 'plane_pair'  // 飞机带对翅膀
  | 'bomb'        // 炸弹
  | 'rocket'      // 王炸
  | 'pass'        // 不出

// 牌型信息
export interface CardType {
  type: CardTypeName
  rank: number // 牌型的主牌等级（用于比较大小）
  cards: Card[] // 构成此牌型的卡牌
}

// 游戏状态
export type GamePhase = 'idle' | 'dealing' | 'grabbing_lord' | 'playing' | 'game_over'

// 游戏难度
export type AIDifficulty = 'easy' | 'normal' | 'hard'

// 游戏设置
export interface GameSettings {
  difficulty: AIDifficulty
}

// 游戏状态
export interface GameState {
  phase: GamePhase
  players: Player[]
  lordPosition: PlayerPosition | null
  deck: Card[] // 剩余牌堆
  bottomCards: Card[] // 底牌（3张）
  currentPlayer: PlayerPosition // 当前出牌玩家
  lastPlayedCards: CardType | null // 上家出的牌
  lastPlayedPlayer: PlayerPosition | null // 上家出牌玩家
  winner: PlayerPosition | null
  settings: GameSettings
  lordCandidate: PlayerPosition | null  // 候选地主
  grabRound: number                      // 当前抢地主轮次 (0-2)
}

// 游戏动作
export type GameAction =
  | { type: 'START_GAME'; settings: GameSettings }
  | { type: 'DEAL_CARDS' }
  | { type: 'PLAY_CARDS'; position: PlayerPosition; cards: Card[] }
  | { type: 'PASS'; position: PlayerPosition }
  | { type: 'RESET_GAME' }
  | { type: 'GRAB_LORD'; position: PlayerPosition }
  | { type: 'PASS_GRAB'; position: PlayerPosition }

// AI决策接口
export interface IAIStrategy {
  decideGrabLord(hand: Card[]): boolean
  decidePlayCard(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[] | 'pass'
}
