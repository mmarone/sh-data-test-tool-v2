import { cleanToken } from "./graphql.js";

export function parseJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * ตรวจ token แล้วคืนข้อความ/คลาสสำหรับ #tokenInfo
 * (ย้ายมาจาก inspectToken เดิม แต่ไม่แตะ DOM)
 * @returns {{text:string, className:string, payload:object|null}}
 */
export function inspectToken(rawToken) {
  const token = cleanToken(rawToken);
  if (!token) {
    return { text: "", className: "token-info", payload: null };
  }
  const payload = parseJwt(token);
  if (!payload) {
    return {
      text: "⚠️ รูปแบบไม่ใช่ JWT (Token ปกติจะขึ้นต้นด้วย eyJ... และมี 3 ส่วนคั่นด้วยจุด)",
      className: "token-info error",
      payload: null
    };
  }
  const exp = payload.exp ? payload.exp * 1000 : null;
  const now = Date.now();
  if (exp && now > exp) {
    const expDate = new Date(exp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return {
      text: `❌ Token หมดอายุไปแล้วตั้งแต่เวลา ${expDate} (กรุณา Login ใน Back Office ใหม่เพื่อเอา Token ล่าสุด)`,
      className: "token-info error",
      payload: null
    };
  }
  const expStr = exp ? ` · หมดอายุ: ${new Date(exp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}` : "";
  const role = payload.role || payload.roles || "";
  const roleStr = role ? ` [${role}]` : "";
  const user = payload.email || payload.username || payload.name || payload.userId || payload.sub || "Admin";
  return {
    text: `✅ Token ถูกต้อง | บัญชี: ${user}${roleStr}${expStr}`,
    className: "token-info success",
    payload
  };
}

// ถอดท่อนกลางของ JWT → object  (ถอดไม่ได้คืน null)
export function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// หมดอายุแล้วหรือยัง (exp เป็นวินาที, Date.now() เป็นมิลลิวินาที)
export function isTokenExpired(exp) {
  return !exp || exp * 1000 <= Date.now();
}
