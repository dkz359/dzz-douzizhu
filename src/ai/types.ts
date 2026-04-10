import { Card, CardType, AIDifficulty } from '../types'

export interface IAIStrategy {
  difficulty: AIDifficulty
  decideGrabLord(hand: Card[]): boolean
  decidePlayCard(
    hand: Card[],
    lastCards: CardType | null,
    isFirstPlay: boolean
  ): Card[]
}