# 抢地主逻辑修复实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复抢地主逻辑，确保 firstGrabber 在 B 或 C 至少一人抢过后获得第二次决策机会

**Architecture:** 修改 GameCore.ts 中的 PASS_GRAB reducer，处理 regrabAfterFirst 状态

**Tech Stack:** TypeScript, React + useReducer

---

## 文件清单

- 修改: `src/engine/GameCore.ts`

---

## 任务 1: 修复 PASS_GRAB 中 isRoundEnd 的处理逻辑

**Files:**
- Modify: `src/engine/GameCore.ts:169-213`

**Logic:**
当 `isRoundEnd && regrabAfterFirst === true` 时，不立即确认地主，而是等待 firstGrabber 做决定。

- [ ] **Step 1: 读取当前 GameCore.ts 文件中 PASS_GRAB 的完整代码**

确认当前 `PASS_GRAB` case 的完整实现，特别是 `isRoundEnd` 分支。

- [ ] **Step 2: 修改 isRoundEnd 分支逻辑**

将原来的：
```javascript
if (isRoundEnd) {
  if (state.lastGrabber !== null && state.lastGrabber !== state.firstGrabber) {
    return { ...confirmLord(state, state.lastGrabber), grabDecisions: newGrabDecisions }
  }
  return { ...confirmLord(state, state.firstGrabber), grabDecisions: newGrabDecisions }
}
```

修改为：
```javascript
if (isRoundEnd) {
  // 如果 B 或 C 在第一轮抢过，firstGrabber 获得第二次机会
  if (state.regrabAfterFirst) {
    return {
      ...state,
      grabDecisions: newGrabDecisions,
      // 不确认地主，等待 firstGrabber 决策
      // currentPlayer 已经指向 firstGrabber
    }
  }
  // 否则（B、C 都过），firstGrabber 自动成为地主
  return { ...confirmLord(state, state.firstGrabber), grabDecisions: newGrabDecisions }
}
```

- [ ] **Step 3: 验证 GRAB_LORD 中 firstGrabber 再次抢的逻辑**

确认当 `currentPlayer === firstGrabber && regrabAfterFirst === true` 时抢地主会确认 firstGrabber 为地主。

当前 GRAB_LORD 中已有这段逻辑（第141-154行），需要确认它正确处理了这种情况。

- [ ] **Step 4: 运行类型检查**

```bash
npm run typecheck
```

预期：无错误

- [ ] **Step 5: 提交**

```bash
git add src/engine/GameCore.ts
git commit -m "fix: give firstGrabber second chance when others grabbed after them"
```

---

## 测试场景验证

修复后手动测试以下场景：

| 场景 | 操作序列 | 预期结果 |
|------|----------|----------|
| 1 | A抢 → B过 → C过 | A 是地主 |
| 2 | A抢 → B抢 → A过 | B 是地主 |
| 3 | A抢 → B过 → C抢 → A过 | C 是地主 |
| 4 | A抢 → B抢 → C过 → A抢 | A 是地主 |
| 5 | A抢 → B过 → C抢 → A抢 | A 是地主 |
