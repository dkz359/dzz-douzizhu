# Bug Fix - 抢地主二次决策逻辑

## 问题描述

当 A 抢 → B 抢 → C 过 时，C PASS 后 A 应该获得第二次选择机会（抢或不抢），但实际上 A 直接成为地主，没有看到任何选择提示。

## 原因分析

1. **LandLordPanel 的 useEffect 自动触发问题**（line 14-23）：

   ```javascript
   useEffect(() => {
     if (currentPlayer === 'player' && grabDecision !== 'none') {
       if (grabDecision === 'grabbed') {
         onGrabLord('player')
       } else {
         onPassGrab('player')
       }
     }
   }, [currentPlayer, grabDecision, onGrabLord, onPassGrab])
   ```

   当 C PASS 后 `currentPlayer` 变回 A，但 A 的 `grabDecision` 已是 `'grabbed'`（之前抢过）。useEffect 检测到这个条件后自动调用 `onGrabLord`，导致 A 直接成为地主。

2. **缺少二次决策状态标记**：GameCore 没有告知前端"这是第二次决策"，前端无法区分"首次决策后的自动确认"和"二次决策时的重新选择"。

## 修复方案

### 条件

只有当 **抢地主的人数 ≥ 2** 时，才需要二次决策。

### 修改文件

#### 1. src/types/index.ts

添加 `needsSecondDecision` 字段：

```typescript
needsSecondDecision: boolean  // 是否需要二次决策
```

#### 2. src/engine/GameCore.ts

**createInitialState**：添加 `needsSecondDecision: false`

**PASS_GRAB action**：修改 `isRoundEnd && regrabAfterFirst` 分支：

```typescript
if (isRoundEnd) {
  // 只有抢地主人数 >= 2 时，才给 firstGrabber 第二次机会
  if (state.regrabAfterFirst) {
    return {
      ...state,
      grabDecisions: newGrabDecisions,
      currentPlayer: state.firstGrabber,
      needsSecondDecision: true,
    }
  }
  // 否则（B、C 都过），firstGrabber 自动成为地主
  return { ...confirmLord(state, state.firstGrabber), grabDecisions: newGrabDecisions }
}
```

#### 3. src/components/LandLordPanel.tsx

修改 useEffect 条件，增加 `needsSecondDecision` 判断：

```typescript
useEffect(() => {
  // 只有非二次决策时，才自动处理已做过的决定
  if (currentPlayer === 'player' && grabDecision !== 'none' && !needsSecondDecision) {
    if (grabDecision === 'grabbed') {
      onGrabLord('player')
    } else {
      onPassGrab('player')
    }
  }
}, [currentPlayer, grabDecision, needsSecondDecision, onGrabLord, onPassGrab])

// 二次决策时，即使之前抢过，也要显示面板
if (grabDecision !== 'none' && !needsSecondDecision) {
  return null
}
```

同时 `LandLordPanelProps` 增加 `needsSecondDecision?: boolean` 属性。

## 流程验证

### 场景1：A 抢 → B 抢 → C 过

| 步骤 | grabCount | regrabAfterFirst | currentPlayer | needsSecondDecision |
|------|-----------|------------------|---------------|---------------------|
| A 抢 | 1 | false | B | - |
| B 抢 | 2 | true | C | - |
| C 过 | 2 | true | A | **true** |

- A 看到面板，可以选择"抢"或"不抢"
- A 抢 → A 成为地主
- A 不抢 → B 成为地主

### 场景2：A 抢 → B 过 → C 过

| 步骤 | grabCount | currentPlayer | needsSecondDecision |
|------|-----------|----------------|---------------------|
| A 抢 | 1 | B | - |
| B 过 | 1 | C | - |
| C 过 | 1 | A | **false** |

- grabCount < 2，不需要二次决策
- A 直接成为地主

### 场景3：A 抢 → B 抢 → C 抢 → A 过 → B 过

| 步骤 | grabCount | regrabAfterFirst | currentPlayer | needsSecondDecision |
|------|-----------|------------------|---------------|---------------------|
| A 抢 | 1 | false | B | - |
| B 抢 | 2 | true | C | - |
| C 抢 | 3 | true | A | **true** |
| A 过 | 3 | true | B | false |
| B 过 | 3 | true | C | false |

- C 抢后 A 需要二次决策
- A 过 → needsSecondDecision 重置为 false
- B 过 → C 成为地主

## 文件变更清单

| 文件 | 变更 |
|------|------|
| `src/types/index.ts` | 添加 `needsSecondDecision` 字段 |
| `src/engine/GameCore.ts` | PASS_GRAB action 添加 `needsSecondDecision: true` |
| `src/components/LandLordPanel.tsx` | useEffect 增加 `needsSecondDecision` 条件判断 |
| `src/components/GameTable.tsx` | 传递 `needsSecondDecision` 给 LandLordPanel |
