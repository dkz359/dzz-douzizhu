import { Card, CardType, AIDifficulty } from '../types'
import { IAIStrategy } from './types'
import { EasyAI } from './EasyAI'
import { NormalAI } from './NormalAI'
import { HardAI } from './HardAI'

export class AIController {
  private strategies: Map<AIDifficulty, IAIStrategy>

  constructor() {
    this.strategies = new Map([
      ['easy', new EasyAI()],
      ['normal', new NormalAI()],
      ['hard', new HardAI()],
    ])
  }

  getStrategy(difficulty: AIDifficulty): IAIStrategy {
    return this.strategies.get(difficulty) || new NormalAI()
  }

  decideGrabLord(difficulty: AIDifficulty, hand: Card[]): boolean {
    return this.getStrategy(difficulty).decideGrabLord(hand)
  }

  decidePlayCard(
    difficulty: AIDifficulty,
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[] | 'pass' {
    return this.getStrategy(difficulty).decidePlayCard(hand, lastCards, isFirstPlay)
  }
}

export const aiController = new AIController()