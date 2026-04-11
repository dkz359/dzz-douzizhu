# 抢地主和出牌状态显示设计

## 目标

在抢地主阶段和出牌阶段，在出牌区域显示玩家状态文字。

## 设计

### 1. 抢地主阶段显示
- `grabbed` → "抢地主"
- `passed` → "不抢"

### 2. 出牌阶段显示
- 有牌时 → 显示牌
- `passed`（不出）→ 显示"不出"

### 3. 实现

修改 `GameTable.tsx` 中的 `PlayedCardsArea` 组件或出牌区域渲染逻辑：

```tsx
// 抢地主阶段
{state.phase === 'grabbing_lord' && state.grabDecisions[position] !== 'none' && (
  <div className="...">
    {state.grabDecisions[position] === 'grabbed' ? '抢地主' : '不抢'}
  </div>
)}

// 出牌阶段
{state.phase === 'playing' && (
  state.roundPlayedCards[position] ? (
    <PlayedCardsArea cards={state.roundPlayedCards[position]} position={position} />
  ) : wasPassed ? (
    <div className="...">不出</div>
  ) : null
)}
```

需要追踪哪个玩家刚选择了 PASS（不出），可以在 state 中添加 `justPassed` 字段，或在 `roundPlayedCards[position] === null` 时检查。

## 文件

- 修改: `src/components/GameTable.tsx`
