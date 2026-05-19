# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run typecheck # TypeScript check
```

## Architecture

### Game State Machine
State flows through `GameCore.ts` reducer: `idle → dealing → grabbing_lord → playing → game_over`

### Core Modules
- **GameCore.ts**: Contains `gameReducer` - the central state machine. Handles all game actions (START_GAME, DEAL_CARDS, SET_LORD, PLAY_CARDS, PASS, RESET_GAME).
- **CardTypes.ts**: Pure functions for card type identification (`identifyCardType`) and comparison (`compareCardTypes`). Defines all valid DouDiZhu card types (single, pair, triple, straight, bomb, rocket, etc.).
- **utils.ts**: Deck creation (`createDeck`), shuffling, and card utilities.

### AI System
Strategy pattern with three difficulty levels:
- `src/ai/EasyAI.ts` - Random valid plays
- `src/ai/NormalAI.ts` - Basic strategy (short straights, singles)
- `src/ai/HardAI.ts` - Advanced (counts cards, coordinates with teammate)
- `AIController.ts` - Factory that returns appropriate strategy

### State Management
`GameContext.tsx` wraps the app with React Context + useReducer. Exposes:
- `state: GameState` - Current game state
- `dispatch: GameAction` - State mutations
- Helper methods: `startGame`, `grabLord`, `playCards`, `pass`, `resetGame`

### Key Types (src/types/index.ts)
- `Card` - {id, suit, rank, isJoker?, jokerType?}
- `CardType` - {type, rank, cards}
- `Player` - {id, position, name, hand, isLord}
- `GameState` - {phase, players, lordPosition, currentPlayer, lastPlayedCards, ...}

### UI Components
- `GameTable.tsx` - Main game layout with player positions
- `PlayerHand.tsx` - Player's cards with selection/play logic
- `AIPlayer.tsx` - AI player display with hand count
- `Card.tsx` - Individual card rendering
- `LandLordPanel.tsx` - "Grab/Don't grab" controls
- `ActionPanel.tsx` - Play/Pass controls during gameplay
- `ResultModal.tsx` - Game over results
- `StartScreen.tsx` - Difficulty selection

### Player Positions
`'player' | 'ai1' | 'ai2'` - Player is human, ai1 is left, ai2 is right
