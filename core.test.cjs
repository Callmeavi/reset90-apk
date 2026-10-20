const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('./core.js');

test('a fresh challenge distinguishes unlogged habits from missed habits', () => {
  const state = core.initialState();
  assert.equal(core.validState(state), true);
  assert.deepEqual(core.dayStats(state, 1), { done: 0, missed: 0, unlogged: 10, percent: 0 });
  state.entries[1] = { steps: 'done', skin: 'missed' };
  assert.deepEqual(core.dayStats(state, 1), { done: 1, missed: 1, unlogged: 8, percent: 10 });
});
test('challenge dates include day 90 and clamp before and after the challenge', () => {
  assert.equal(core.elapsed('2026-01-01', '2025-12-31'), 0);
  assert.equal(core.elapsed('2026-01-01', '2026-01-01'), 1);
  assert.equal(core.elapsed('2026-01-01', '2026-03-31'), 90);
  assert.equal(core.elapsed('2026-01-01', '2026-12-31'), 90);
  assert.equal(core.localDate(core.dateFor('2026-01-01', 89)), '2026-03-31');
});
test('analytics counts all elapsed opportunities, not future days', () => {
  const state = core.initialState();
  state.start = '2026-01-01';
  state.entries[1] = Object.fromEntries(state.habits.map(habit => [habit.id, 'done']));
  state.entries[2] = { steps: 'missed' };
  const stats = core.analytics(state, '2026-01-02');
  assert.deepEqual(stats, { elapsed: 2, done: 10, missed: 1, unlogged: 9, percent: 50, streak: 1, best: 1 });
  assert.equal(core.analytics(state, '2026-01-03').streak, 0);
});
test('a finished challenge does not forgive an incomplete last day', () => {
  const state = core.initialState();
  state.start = '2026-01-01';
  state.entries[89] = Object.fromEntries(state.habits.map(habit => [habit.id, 'done']));
  assert.equal(core.analytics(state, '2026-04-01').streak, 0);
});
test('backups reject invalid dates, duplicate IDs and invalid status values', () => {
  const state = core.initialState();
  state.start = '2026-02-30';
  assert.equal(core.validState(state), false);
  state.start = '2026-02-01';
  state.entries[1] = { steps: 'maybe' };
  assert.equal(core.validState(state), false);
  state.entries = {};
  state.habits.push(state.habits[0]);
  assert.equal(core.validState(state), false);
});