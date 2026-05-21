import { getAccessToken } from './auth.js'

const BASE = 'https://www.googleapis.com'

async function gFetch(url) {
  const token = getAccessToken()
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Google API error: ${res.status}`)
  return res.json()
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export async function fetchCalendarEvents(timeMin, timeMax) {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 500,
  })
  const data = await gFetch(`${BASE}/calendar/v3/calendars/primary/events?${params}`)
  return data.items || []
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function fetchTaskLists() {
  const data = await gFetch(`${BASE}/tasks/v1/users/@me/lists`)
  return data.items || []
}

export async function fetchTasks(taskListId, showCompleted = true) {
  const params = new URLSearchParams({
    showCompleted,
    showHidden: true,
    maxResults: 100,
  })
  const data = await gFetch(`${BASE}/tasks/v1/lists/${taskListId}/tasks?${params}`)
  return data.items || []
}

export async function fetchAllTasks() {
  const lists = await fetchTaskLists()
  const allTasks = await Promise.all(lists.map(l => fetchTasks(l.id)))
  return allTasks.flat()
}

// ─── Productivity Aggregation ─────────────────────────────────────────────────

function startOfDay(d) {
  const x = new Date(d); x.setHours(0,0,0,0); return x
}

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10)
}

export async function getProductivityData(rangeType = 'week') {
  const now = new Date()
  let timeMin

  if (rangeType === 'week') {
    timeMin = new Date(now); timeMin.setDate(now.getDate() - 6)
  } else if (rangeType === 'month') {
    timeMin = new Date(now); timeMin.setDate(now.getDate() - 29)
  } else {
    timeMin = new Date(now); timeMin.setFullYear(now.getFullYear() - 1)
  }

  timeMin = startOfDay(timeMin)

  const [events, tasks] = await Promise.all([
    fetchCalendarEvents(timeMin, now),
    fetchAllTasks(),
  ])

  // Build day buckets
  const buckets = {}
  const cursor = new Date(timeMin)
  while (cursor <= now) {
    buckets[dayKey(cursor)] = { events: 0, tasksCompleted: 0, score: 0 }
    cursor.setDate(cursor.getDate() + 1)
  }

  // Count events per day
  for (const ev of events) {
    const start = ev.start?.dateTime || ev.start?.date
    if (!start) continue
    const k = dayKey(start)
    if (buckets[k]) buckets[k].events++
  }

  // Count completed tasks per day
  for (const task of tasks) {
    if (task.status !== 'completed' || !task.completed) continue
    const k = dayKey(task.completed)
    if (buckets[k]) buckets[k].tasksCompleted++
  }

  // Score = weighted: tasks * 10 + events * 5, capped at 100
  for (const k in buckets) {
    const b = buckets[k]
    b.score = Math.min(100, b.tasksCompleted * 10 + b.events * 5)
  }

  // For yearly view, aggregate by week
  if (rangeType === 'year') {
    return aggregateByWeek(buckets)
  }

  return Object.entries(buckets).map(([date, val]) => ({
    label: rangeType === 'week'
      ? new Date(date).toLocaleDateString('en', { weekday: 'short' })
      : new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    date,
    ...val,
  }))
}

function aggregateByWeek(buckets) {
  const weeks = {}
  for (const [date, val] of Object.entries(buckets)) {
    const d = new Date(date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const wk = dayKey(weekStart)
    if (!weeks[wk]) weeks[wk] = { events: 0, tasksCompleted: 0, score: 0, count: 0 }
    weeks[wk].events += val.events
    weeks[wk].tasksCompleted += val.tasksCompleted
    weeks[wk].count++
  }
  return Object.entries(weeks).map(([date, val]) => ({
    label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    date,
    events: val.events,
    tasksCompleted: val.tasksCompleted,
    score: Math.min(100, Math.round((val.events * 5 + val.tasksCompleted * 10) / val.count)),
  }))
}

// Summary stats for Gemini
export function buildSummary(data) {
  const avg = data.reduce((s, d) => s + d.score, 0) / (data.length || 1)
  const best = data.reduce((a, b) => a.score > b.score ? a : b, data[0] || {})
  const worst = data.reduce((a, b) => a.score < b.score ? a : b, data[0] || {})
  const totalTasks = data.reduce((s, d) => s + d.tasksCompleted, 0)
  const totalEvents = data.reduce((s, d) => s + d.events, 0)
  const zeroDays = data.filter(d => d.score === 0).length

  return { avg: Math.round(avg), best, worst, totalTasks, totalEvents, zeroDays, days: data.length }
}
