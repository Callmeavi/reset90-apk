(() => {
  'use strict';
  const C = ResetCore;
  const KEY = 'reset90.challenge.v1';
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const icon = name => `<i data-lucide="${escape(name)}"></i>`;
  let state = C.initialState();
  let storageAvailable = true;
  let startupMessage = '';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (C.validState(parsed)) state = parsed;
      else { storageAvailable = false; startupMessage = 'Saved data could not be read. Export a backup before resetting your challenge.'; }
    }
  } catch { storageAvailable = false; startupMessage = 'Browser storage is unavailable. Export a backup to keep your progress.'; }
  let selectedDay = Math.max(1, C.elapsed(state.start));
  let category = 'All';
  let view = 'today';
  let toastTimer;
  const dateLabel = (date, options) => date.toLocaleDateString(undefined, options);
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function save() {
    try {
      if (!storageAvailable) throw new Error('Storage unavailable');
      localStorage.setItem(KEY, JSON.stringify(state));
      $('#save-status').textContent = 'Saved on this device';
      return true;
    } catch {
      $('#save-status').textContent = 'Not saved - export a backup';
      toast('Progress is in memory only. Export a backup from settings.');
      return false;
    }
  }
  function canLog(day = selectedDay) { return C.localDate(C.dateFor(state.start, day - 1)) <= C.localDate(); }
  function renderOverview() {
    const stats = C.analytics(state);
    const end = C.dateFor(state.start, 89);
    $('#today-label').textContent = dateLabel(new Date(), { month: 'short', day: 'numeric', year: 'numeric' });
    $('#side-progress').style.width = `${stats.elapsed / 90 * 100}%`;
    $('#side-caption').textContent = `${stats.elapsed} of 90 days ${stats.elapsed === 90 ? 'complete' : 'into your journey'}`;
    $('#challenge-dates').textContent = `${dateLabel(C.dateFor(state.start, 0), { month: 'short', day: 'numeric', year: 'numeric' })} - ${dateLabel(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    $('#banner-fill').style.width = `${stats.elapsed / 90 * 100}%`;
    $('#challenge-day').textContent = stats.elapsed ? `DAY ${stats.elapsed} OF 90` : 'YOUR NEXT CHAPTER IS AHEAD';
    $('#challenge-remaining').textContent = `${90 - stats.elapsed} days ahead`;
    $('#stat-completion').innerHTML = `${stats.percent}<span>%</span>`;
    $('#stat-streak').innerHTML = `${stats.streak}<span>${stats.streak === 1 ? 'day' : 'days'}</span>`;
    $('#best-streak').textContent = `Best: ${stats.best} ${stats.best === 1 ? 'day' : 'days'}`;
    $('#stat-done').textContent = stats.done;
    $('#stat-days').innerHTML = `${stats.elapsed}<span>/ 90 days</span>`;
    $('#end-date').textContent = `Finish line: ${dateLabel(end, { month: 'short', day: 'numeric' })}`;
  }
  function renderDaily() {
    const date = C.dateFor(state.start, selectedDay - 1);
    const stats = C.dayStats(state, selectedDay);
    const writable = canLog();
    $('#selected-date').textContent = `DAY ${selectedDay} / ${dateLabel(date, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}`;
    $('#selected-heading').textContent = selectedDay === C.elapsed(state.start) && C.localDate(date) === C.localDate() ? 'Your daily rituals' : `Day ${selectedDay} rituals`;
    $('#previous-day').disabled = selectedDay === 1;
    $('#next-day').disabled = selectedDay === 90;
    const weekStart = Math.floor((selectedDay - 1) / 7) * 7 + 1;
    $('#week-strip').innerHTML = Array.from({ length: Math.min(7, 91 - weekStart) }, (_, index) => {
      const day = weekStart + index;
      const dayDate = C.dateFor(state.start, day - 1);
      const complete = C.dayStats(state, day).percent === 100;
      return `<button class="week-day ${day === selectedDay ? 'active' : ''} ${complete ? 'complete' : ''} ${C.localDate(dayDate) === C.localDate() ? 'current' : ''}" data-day="${day}" aria-label="Day ${day}, ${escape(dateLabel(dayDate, { month: 'long', day: 'numeric' }))}" aria-pressed="${day === selectedDay}"><span class="weekday">${escape(dateLabel(dayDate, { weekday: 'short' }))}</span><strong>${dayDate.getDate()}</strong><span class="week-dot"></span></button>`;
    }).join('');
    const categories = ['All', ...new Set(state.habits.map(habit => habit.category))];
    if (!categories.includes(category)) category = 'All';
    $('#category-tabs').innerHTML = categories.map(name => `<button class="category-tab ${category === name ? 'active' : ''}" data-category-filter="${escape(name)}" aria-pressed="${category === name}">${escape(name)}</button>`).join('');
    $('#habit-count').textContent = `${stats.done}/${state.habits.length} done`;
    $('#future-notice').hidden = writable;
    $('#habit-list').innerHTML = state.habits.filter(habit => category === 'All' || habit.category === category).map(habit => {
      const status = state.entries[selectedDay]?.[habit.id];
      return `<article class="habit-row" data-category="${escape(habit.category)}"><span class="habit-symbol">${icon(habit.icon)}</span><div class="habit-text"><h3>${escape(habit.name)}</h3><p>${escape(habit.target)}</p></div><span class="habit-status ${status || ''}">${status === 'done' ? 'Done' : status === 'missed' ? 'Missed' : ''}</span><div class="status-buttons"><button class="status-button done" data-habit="${escape(habit.id)}" data-status="done" aria-label="${escape(habit.name)}: done" title="Done (click again to clear)" aria-pressed="${status === 'done'}" ${writable ? '' : 'disabled'}>${icon('check')}</button><button class="status-button missed" data-habit="${escape(habit.id)}" data-status="missed" aria-label="${escape(habit.name)}: missed" title="Missed (click again to clear)" aria-pressed="${status === 'missed'}" ${writable ? '' : 'disabled'}>${icon('x')}</button></div></article>`;
    }).join('');
    $('#daily-donut').style.background = `conic-gradient(var(--green) ${stats.percent}%, #edf1e9 ${stats.percent}%)`;
    $('#daily-percent').textContent = `${stats.percent}%`;
    $('#daily-done').textContent = stats.done;
    $('#daily-missed').textContent = stats.missed;
    $('#daily-open').textContent = stats.unlogged;
    $('#daily-message').textContent = stats.percent === 100 ? 'Every promise kept. Take this moment in.' : stats.done ? 'Little by little, you are showing up.' : stats.missed ? 'There is still room for a small win.' : 'A little intention goes a long way.';
    $('#daily-note').value = state.notes[selectedDay] || '';
    $('#daily-note').disabled = !writable;
    $('#note-status').textContent = state.notes[selectedDay] ? 'Your reflection, kept here.' : 'Just for you.';
    $('#clear-day').disabled = !writable || (!stats.done && !stats.missed);
  }
  function renderJourney() {
    $('#journey-grid').innerHTML = Array.from({ length: 90 }, (_, index) => {
      const day = index + 1;
      const stats = C.dayStats(state, day);
      const future = !canLog(day);
      const style = future ? 'future' : stats.percent === 100 ? 'complete' : stats.done ? 'partial' : stats.missed ? 'missed' : '';
      return `<button class="journey-day ${style} ${selectedDay === day ? 'selected' : ''}" data-day="${day}" aria-label="Day ${day}, ${future ? 'upcoming' : `${stats.done} of ${state.habits.length} done`}"><strong>${String(day).padStart(2, '0')}</strong><span>${future ? 'Upcoming' : stats.done || stats.missed ? `${stats.done}/${state.habits.length}` : 'Not logged'}</span></button>`;
    }).join('');
    $('#milestones').innerHTML = [7, 30, 60, 90].map(day => {
      const loggedDays = Array.from({ length: day }, (_, index) => C.dayStats(state, index + 1)).filter(stats => stats.done + stats.missed > 0).length;
      return `<div class="milestone ${loggedDays === day ? 'achieved' : ''}">${icon(day === 90 ? 'trophy' : 'flag')}<span>${day}-day check-ins<br>${loggedDays}/${day} days logged</span></div>`;
    }).join('');
  }
  function renderInsights() {
    const stats = C.analytics(state);
    $('#weekly-chart').innerHTML = Array.from({ length: 13 }, (_, index) => {
      const start = index * 7 + 1;
      const end = Math.min(start + 6, stats.elapsed);
      let done = 0;
      for (let day = start; day <= end; day++) done += C.dayStats(state, day).done;
      const percent = end >= start ? Math.round(done / ((end - start + 1) * state.habits.length) * 100) : 0;
      return `<div class="chart-column ${stats.elapsed >= start && stats.elapsed <= start + 6 ? 'current' : ''}" aria-label="Week ${index + 1}: ${start > stats.elapsed ? 'upcoming' : `${percent}%`} "><span class="chart-value">${start > stats.elapsed ? '-' : `${percent}%`}</span><div class="chart-bar" style="height:${percent * 1.5}px;${start > stats.elapsed ? 'background:#e7ece2' : ''}"></div><span class="chart-week">W${index + 1}</span></div>`;
    }).join('');
    $('#checkin-summary').innerHTML = [['Done', stats.done], ['Missed', stats.missed], ['Not logged', stats.unlogged]].map(([label, count]) => `<div class="summary-line"><span>${label}</span><strong>${count}</strong></div>`).join('');
    $('#habit-breakdown').innerHTML = state.habits.map(habit => {
      let done = 0;
      for (let day = 1; day <= stats.elapsed; day++) if (state.entries[day]?.[habit.id] === 'done') done++;
      const percent = stats.elapsed ? Math.round(done / stats.elapsed * 100) : 0;
      return `<div class="breakdown-row"><div class="breakdown-title">${icon(habit.icon)}<span>${escape(habit.name)}</span></div><div class="breakdown-track" role="meter" aria-label="${escape(habit.name)} completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${percent}%"></span></div><div class="breakdown-score">${percent}%<small>${done}/${stats.elapsed} days</small></div></div>`;
    }).join('');
  }
  function render() {
    renderOverview();
    renderDaily();
    if (view === 'journey') renderJourney();
    if (view === 'insights') renderInsights();
    icons();
  }
  function setView(next) {
    view = ['today', 'journey', 'insights'].includes(next) ? next : 'today';
    document.querySelectorAll('.view').forEach(element => { element.hidden = element.id !== `${view}-view`; });
    document.querySelectorAll('[data-view]').forEach(element => { element.classList.toggle('active', element.dataset.view === view); element.setAttribute('aria-current', element.dataset.view === view ? 'page' : 'false'); });
    const copy = { today: ['YOUR NEXT CHAPTER', 'Make room for you.', "A fresh start. Small promises. A day that's yours."], journey: ['ONE DAY AT A TIME', 'Look how far you go.', 'Every day is a new place to begin.'], insights: ['YOUR PERSONAL PATTERNS', 'Small steps, adding up.', 'A little perspective on the promises you keep.'] }[view];
    ['#page-eyebrow', '#page-title', '#page-subtitle'].forEach((selector, index) => { $(selector).textContent = copy[index]; });
    render();
  }
  function renderManage() {
    $('#manage-count').textContent = `${state.habits.length}/30 habits`;
    $('#manage-list').innerHTML = state.habits.map(habit => `<div class="manage-row"><span>${escape(habit.name)}</span><button class="icon-button" data-edit="${escape(habit.id)}" title="Edit ${escape(habit.name)}" aria-label="Edit ${escape(habit.name)}">${icon('pencil')}</button><button class="icon-button delete-habit" data-delete="${escape(habit.id)}" title="Delete ${escape(habit.name)}" aria-label="Delete ${escape(habit.name)}">${icon('trash-2')}</button></div>`).join('');
    $('#add-habit').disabled = state.habits.length >= 30;
    icons();
  }
  function openSettings() { $('#start-date').value = state.start; renderManage(); $('#settings-dialog').showModal(); }
  function openHabit(id) {
    const habit = state.habits.find(item => item.id === id);
    $('#habit-dialog-title').textContent = habit ? 'Edit your habit' : 'A new small promise';
    $('#habit-id').value = habit?.id || '';
    $('#habit-name').value = habit?.name || '';
    $('#habit-target').value = habit?.target || '';
    $('#habit-category').value = habit?.category || 'Mind';
    $('#habit-dialog').showModal();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.view) { location.hash = button.dataset.view; setView(button.dataset.view); }
    if (button.dataset.close) $(`#${button.dataset.close}`).close();
    if (button.dataset.day) { selectedDay = Number(button.dataset.day); if (view !== 'today') { location.hash = 'today'; setView('today'); } else render(); }
    if (button.dataset.categoryFilter) { category = button.dataset.categoryFilter; renderDaily(); icons(); }
    if (button.dataset.habit && canLog()) {
      const entries = state.entries[selectedDay] ||= {};
      if (entries[button.dataset.habit] === button.dataset.status) delete entries[button.dataset.habit];
      else entries[button.dataset.habit] = button.dataset.status;
      save(); render();
      const replacement = document.querySelector(`[data-habit="${button.dataset.habit}"][data-status="${button.dataset.status}"]`);
      replacement?.focus({ preventScroll: true });
    }
    if (button.dataset.edit) openHabit(button.dataset.edit);
    if (button.dataset.delete) {
      const habit = state.habits.find(item => item.id === button.dataset.delete);
      if (state.habits.length === 1) { toast('Keep at least one habit in your challenge.'); return; }
      if (!confirm(`Delete "${habit.name}" and its check-ins from every day? This changes historical completion percentages.`)) return;
      state.habits = state.habits.filter(item => item.id !== habit.id);
      Object.values(state.entries).forEach(entries => { delete entries[habit.id]; });
      save(); renderManage(); render();
    }
  });
  $('#previous-day').addEventListener('click', () => { selectedDay = Math.max(1, selectedDay - 1); render(); });
  $('#next-day').addEventListener('click', () => { selectedDay = Math.min(90, selectedDay + 1); render(); });
  $('#go-today').addEventListener('click', () => { selectedDay = Math.max(1, C.elapsed(state.start)); render(); });
  $('#settings-button').addEventListener('click', openSettings);
  $('#manage-button').addEventListener('click', openSettings);
  $('#add-habit').addEventListener('click', () => openHabit());
  $('#clear-day').addEventListener('click', () => { if (canLog() && confirm(`Clear all habit check-ins for Day ${selectedDay}? Your reflection will stay.`)) { delete state.entries[selectedDay]; save(); render(); } });
  $('#daily-note').addEventListener('input', () => {
    if (!canLog()) return;
    state.notes[selectedDay] = $('#daily-note').value;
    $('#note-status').textContent = save() ? 'Reflection saved.' : 'Not saved - export a backup.';
  });
  $('#settings-form').addEventListener('submit', event => {
    event.preventDefault();
    const start = $('#start-date').value;
    if (start !== state.start && Object.keys(state.entries).length && !confirm('Move your challenge dates? Existing check-ins stay attached to Day 1, Day 2, and so on.')) return;
    const next = { ...state, start };
    if (!C.validState(next)) { toast('Please choose a valid date.'); return; }
    state = next; selectedDay = Math.max(1, C.elapsed(state.start)); save(); render(); toast('Challenge date updated.');
  });
  $('#habit-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#habit-name').value.trim();
    const target = $('#habit-target').value.trim();
    if (!name || !target) { toast('Add a habit name and a daily goal.'); return; }
    const id = $('#habit-id').value;
    const habitCategory = $('#habit-category').value;
    if (id) Object.assign(state.habits.find(habit => habit.id === id), { name, target, category: habitCategory });
    else {
      if (state.habits.length >= 30) return;
      if (Object.keys(state.entries).length && !confirm('Add this habit to all 90 days? Previous days will show it as not logged, which changes completion percentages.')) return;
      const categoryIcons = { Movement: 'footprints', 'Self-care': 'heart', Nutrition: 'salad', Mind: 'book-open', Other: 'star' };
      state.habits.push({ id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name, target, category: habitCategory, icon: categoryIcons[habitCategory] });
    }
    save(); $('#habit-dialog').close(); renderManage(); render(); toast('Habit saved.');
  });
  $('#export-data').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `reset90-backup-${C.localDate()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Backup exported.');
  });
  $('#import-data').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000) throw new Error('Too large');
      const parsed = JSON.parse(await file.text());
      if (!C.validState(parsed)) throw new Error('Invalid backup');
      if (!confirm('Replace your current challenge with this backup? Export your current data first if you need it.')) return;
      state = parsed; storageAvailable = true; selectedDay = Math.max(1, C.elapsed(state.start)); save(); renderManage(); render(); $('#start-date').value = state.start; toast('Backup restored.');
    } catch { toast('This file is not a valid Reset 90 backup. Nothing was changed.'); }
    finally { event.target.value = ''; }
  });
  $('#reset-data').addEventListener('click', () => {
    if (!confirm('Permanently remove every check-in, reflection and custom habit? Export a backup first.')) return;
    state = C.initialState(); storageAvailable = true; selectedDay = 1; category = 'All'; save(); renderManage(); render(); $('#start-date').value = state.start; toast('A fresh chapter starts today.');
  });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  setView(location.hash.slice(1));
  if (startupMessage) { $('#save-status').textContent = 'Not saved - export a backup'; toast(startupMessage); }
})();