(function (root) {
  'use strict';
  const DAYS = 90;
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  function dateFor(start, offset) {
    const date = new Date(`${start}T12:00:00`);
    date.setDate(date.getDate() + offset);
    return date;
  }
  function elapsed(start, today = localDate()) {
    const utcDay = value => Date.parse(`${value}T00:00:00Z`) / 86400000;
    return Math.max(0, Math.min(DAYS, utcDay(today) - utcDay(start) + 1));
  }
  function initialState() {
    return {
      version: 1, start: localDate(), notes: {}, entries: {},
      habits: [
        { id: 'steps', name: 'Move my body', target: '10,000 steps', category: 'Movement', icon: 'footprints' },
        { id: 'skin', name: 'Skincare ritual', target: 'AM + PM routine', category: 'Self-care', icon: 'sparkles' },
        { id: 'hair', name: 'Haircare', target: 'My daily hair routine', category: 'Self-care', icon: 'heart' },
        { id: 'work', name: 'Focused office work', target: 'Finish my top 3 priorities', category: 'Mind', icon: 'briefcase-business' },
        { id: 'sugar', name: 'No added sugar', target: 'A day without added sugar', category: 'Nutrition', icon: 'cherry' },
        { id: 'junk', name: 'No junk food', target: 'Choose nourishing meals', category: 'Nutrition', icon: 'salad' },
        { id: 'read', name: 'Read something', target: '30 minutes of reading', category: 'Mind', icon: 'book-open' },
        { id: 'water', name: 'Stay hydrated', target: 'My personal water goal', category: 'Nutrition', icon: 'droplets' },
        { id: 'sleep', name: 'Rest well', target: '7-9 hours of sleep', category: 'Self-care', icon: 'moon' },
        { id: 'pause', name: 'A mindful moment', target: '10 minutes for myself', category: 'Mind', icon: 'flower-2' }
      ]
    };
  }
  function dayStats(state, day) {
    const values = state.entries[day] || {};
    const done = state.habits.filter(habit => values[habit.id] === 'done').length;
    const missed = state.habits.filter(habit => values[habit.id] === 'missed').length;
    return { done, missed, unlogged: state.habits.length - done - missed, percent: state.habits.length ? Math.round(done / state.habits.length * 100) : 0 };
  }
  function analytics(state, today = localDate()) {
    const count = elapsed(state.start, today);
    let done = 0, missed = 0, best = 0, run = 0;
    for (let day = 1; day <= count; day++) {
      const stats = dayStats(state, day);
      done += stats.done;
      missed += stats.missed;
      run = stats.percent === 100 ? run + 1 : 0;
      best = Math.max(best, run);
    }
    let cursor = count;
    if (cursor && dayStats(state, cursor).percent !== 100 && today === localDate(dateFor(state.start, cursor - 1))) cursor--;
    let streak = 0;
    while (cursor > 0 && dayStats(state, cursor--).percent === 100) streak++;
    const possible = count * state.habits.length;
    return { elapsed: count, done, missed, unlogged: possible - done - missed, percent: possible ? Math.round(done / possible * 100) : 0, streak, best };
  }
  function validState(state) {
    if (!state || state.version !== 1 || typeof state.start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(state.start)) return false;
    if (!Number.isFinite(Date.parse(`${state.start}T12:00:00`)) || localDate(dateFor(state.start, 0)) !== state.start) return false;
    if (!Array.isArray(state.habits) || !state.habits.length || state.habits.length > 30) return false;
    const ids = new Set();
    for (const habit of state.habits) {
      if (!habit || typeof habit.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(habit.id) || ids.has(habit.id)) return false;
      ids.add(habit.id);
      if (!['name', 'target', 'category', 'icon'].every(key => typeof habit[key] === 'string' && habit[key].length <= 150)) return false;
      if (!habit.name.trim()) return false;
    }
    if (!state.entries || typeof state.entries !== 'object' || Array.isArray(state.entries) || !state.notes || typeof state.notes !== 'object' || Array.isArray(state.notes)) return false;
    for (const [day, entries] of Object.entries(state.entries)) {
      if (!/^([1-9]|[1-8][0-9]|90)$/.test(day) || !entries || typeof entries !== 'object' || Array.isArray(entries)) return false;
      if (!Object.entries(entries).every(([id, value]) => ids.has(id) && ['done', 'missed'].includes(value))) return false;
    }
    return Object.entries(state.notes).every(([day, note]) => /^([1-9]|[1-8][0-9]|90)$/.test(day) && typeof note === 'string' && note.length <= 5000);
  }
  const api = { DAYS, localDate, dateFor, elapsed, initialState, dayStats, analytics, validState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ResetCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);