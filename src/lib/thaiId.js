// ===== เลขบัตรประชาชนสำหรับทดสอบ =====

// หลักที่ 13 = (11 - (ผลรวม d[i] * (13 - i)) % 11) % 10
export function thaiIdCheckDigit(first12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (13 - i);
  return (11 - (sum % 11)) % 10;
}

export function isValidThaiId(digits) {
  return /^\d{13}$/.test(digits) && thaiIdCheckDigit(digits) === Number(digits[12]);
}

export function randomThaiId() {
  // หลักแรก 1-8, ที่เหลือสุ่ม แล้วคำนวณหลักสุดท้าย
  let s = String(1 + Math.floor(Math.random() * 8));
  for (let i = 0; i < 11; i++) s += Math.floor(Math.random() * 10);
  return s + thaiIdCheckDigit(s);
}

// 1234567890123 → 1 2345 67890 12 3
export function formatThaiId(digits) {
  const d = digits.padEnd(13, "_");
  return `${d[0]} ${d.slice(1, 5)} ${d.slice(5, 10)} ${d.slice(10, 12)} ${d[12]}`;
}
