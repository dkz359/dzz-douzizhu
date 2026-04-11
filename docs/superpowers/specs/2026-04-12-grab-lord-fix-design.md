# 抢地主逻辑修复设计

## 目标

修复斗地主游戏中抢地主流程的逻辑，确保 firstGrabber（第一个抢的人）在特定条件下获得第二次决策机会。

## 规则确认

1. 随机选 A 开始抢地主
2. B 和 C 轮流表态（抢或过）
3. **只要 B 或 C 中至少有一人抢了，A 就有第二次机会**
4. A 再抢 → A 是地主；A 过 → 最后抢的人（B 或 C）是地主
5. 如果 B 和 C 都过 → A 自动成为地主

## 当前问题

在 `PASS_GRAB` 处理中，当 `isRoundEnd`（回到 firstGrabber）时，代码直接确认地主，没有给 firstGrabber 再次决策的机会。

```javascript
// 当前代码（有bug）
if (isRoundEnd) {
  if (state.lastGrabber !== null && state.lastGrabber !== state.firstGrabber) {
    return { ...confirmLord(state, state.lastGrabber), ... }
  }
  return { ...confirmLord(state, state.firstGrabber), ... }
}
```

## 修复方案

修改 `PASS_GRAB`，当 `isRoundEnd && regrabAfterFirst === true` 时，**不立即确认地主**，而是等待 firstGrabber 做决定：

| 条件 | 结果 |
|------|------|
| `regrabAfterFirst === false`（B、C 都过） | 直接确认 firstGrabber 为地主 |
| `regrabAfterFirst === true`（B 或 C 抢过） | 不确认，等 firstGrabber 决策 |

### 具体修改

在 `PASS_GRAB` 的 `isRoundEnd` 分支中：

```javascript
if (isRoundEnd) {
  // 如果是 B 或 C 在第一轮抢了，firstGrabber 获得第二次机会
  if (state.regrabAfterFirst) {
    return {
      ...state,
      grabDecisions: newGrabDecisions,
      // 不确认地主，等待 firstGrabber 决策
    }
  }
  // 否则（B、C 都过），firstGrabber 自动成为地主
  return { ...confirmLord(state, state.firstGrabber), grabDecisions: newGrabDecisions }
}
```

同时，`GRAB_LORD` 中需要确保当 `currentPlayer === firstGrabber && regrabAfterFirst === true` 时，直接确认 firstGrabber 为地主。

## 状态追踪

- `firstGrabber`: 第一个抢的玩家
- `lastGrabber`: 上一个抢的玩家
- `regrabAfterFirst`: 是否有人比 firstGrabber 后抢过
- `grabDecisions`: 记录每个玩家的决定（none/grabbed/passed）

## 测试场景

| 场景 | A | B | C | 结果 |
|------|---|---|---|------|
| 1 | 抢 | 过 | 过 | A 是地主 |
| 2 | 抢 | 抢 | 过 | A 再抢→A是，不抢→B是 |
| 3 | 抢 | 过 | 抢 | A 再抢→A是，不抢→C是 |
| 4 | 抢 | 抢 | 抢 | A 再抢→A是，不抢→C是（最后抢的） |
