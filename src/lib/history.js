// History ของกิจกรรมที่สร้างจากเครื่องมือนี้ (localStorage "starHistory")
import { readJson } from "./utils.js";

export const HISTORY_KEY = "starHistory";

export function loadHistory() {
  return readJson(HISTORY_KEY, []);
}

export function persistHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

// unshift + จำกัด 100 รายการ (เหมือน saveHistory เดิม)
export function withNewHistoryItem(list, item) {
  return [{ ...item, createdAt: new Date().toISOString() }, ...list].slice(0, 100);
}
