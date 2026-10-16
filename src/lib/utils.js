export function pad(n) { return String(n).padStart(2, "0"); }

// Date → ค่าที่ใส่ใน <input type="datetime-local">
export function localInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ค่าจาก datetime-local → string timestamp (ms) หรือ null
export function msFromLocal(v) {
  if (!v) return null;
  return String(new Date(v).getTime());
}

export function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }

export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// สุ่มเลือก min..max ตัวแบบไม่ซ้ำ โดยคงลำดับเดิมของ arr ไว้
export function randomSubsetInOrder(arr, min, max) {
  const count = randomInt(min, Math.min(max, arr.length));
  const picked = new Set(shuffle(arr).slice(0, count));
  return arr.filter(item => picked.has(item));
}

export function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-+|-+$/g, "");
}

export function compact(values) {
  return values.filter(value => value !== null && value !== undefined && value !== "");
}

export function formatFollower(count) {
  if (!count) return null;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

let uidCounter = 0;
export function uid() { return `${Date.now().toString(36)}-${(uidCounter++).toString(36)}`; }

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
