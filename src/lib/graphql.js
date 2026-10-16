// ==========================================
// GraphQL client — ยิงตรงจาก browser ไม่ผ่าน proxy
// ==========================================
// เดิม server.js ทำหน้าที่ proxy ไป API พร้อมแนบ header origin/referer
// ตอนนี้ API เปิด CORS ให้ทุก origin แล้ว จึงยิงตรงได้
// header ที่ browser ตั้งเองไม่ได้ (origin, referer, cookie) จะถูกตัดออก

const env = import.meta.env || {};

export const ADMIN_GRAPHQL_ENDPOINTS = {
  sit: env.VITE_ADMIN_GQL_SIT || "https://sit-api-admin.sh-pxmer.co/graphql",
  uat: env.VITE_ADMIN_GQL_UAT || "https://uat-api-admin.sh-pxmer.co/graphql"
};

export const FRONT_GRAPHQL_ENDPOINTS = {
  sit: env.VITE_FRONT_GQL_SIT || "https://sit-api.sh-pxmer.co/graphql",
  uat: env.VITE_FRONT_GQL_UAT || "https://uat-api.sh-pxmer.co/graphql"
};

export function cleanToken(raw) {
  if (!raw) return "";
  let token = raw.trim();
  if (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, "").trim();
  }
  token = token.replace(/^["']|["']$/g, "").trim();
  return token;
}

async function postGraphQL(url, headers, query, variables) {
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables })
    });
  } catch (err) {
    // fetch ล้มเหลวก่อนได้ response = network / CORS
    throw new Error(
      `เชื่อมต่อ API ไม่ได้ (${err.message}) — ตรวจสอบอินเทอร์เน็ต หรือ API อาจไม่อนุญาต CORS จาก origin นี้`
    );
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  return { res, text, json };
}

/**
 * Admin GraphQL (Back Office) — ใช้ใน tab Sale Here STAR
 * @param {{environment:string, token:string, log?:Function}} ctx
 */
export async function adminGql(ctx, query, variables) {
  const { environment, log } = ctx;
  const token = cleanToken(ctx.token);

  if (!token) {
    throw new Error(`ไม่พบ Bearer Token สำหรับ ${environment.toUpperCase()}`);
  }

  const url = ADMIN_GRAPHQL_ENDPOINTS[environment];
  if (!url) throw new Error("Unknown GraphQL environment");

  console.log("[GraphQL Request]", { endpoint: url, environment, variables });

  const { res, text, json: parsed } = await postGraphQL(
    url,
    {
      "content-type": "application/json",
      "accept": "*/*",
      "authorization": token,
      "skiprefresh": "true"
    },
    query,
    variables
  );
  const json = parsed ?? { raw: text };

  console.log("[GraphQL Response]", { status: res.status, json });
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}: ${text}`);
  if (json.errors?.length) {
    const err = json.errors[0];
    const code = err.extensions?.code ? ` (${err.extensions.code})` : "";
    const path = err.path?.length ? ` [${err.path.join(".")}]` : "";
    const ext = err.extensions || {};
    const extStr = JSON.stringify(ext);
    console.error("[GraphQL Full Error]", json.errors);
    log?.(`[Error Detail] ${err.message}${code}${path} | Ext: ${extStr}`, "error");
    throw new Error(`[Server ตอบ: ${err.message}${code}${path}] Ext: ${extStr}`);
  }
  return json.data;
}

/**
 * Front GraphQL (เว็บหน้าบ้าน) — ใช้ใน tab Verify User
 * @param {{environment:string, token:string}} ctx
 */
export async function frontGql(ctx, query, variables = {}) {
  const token = cleanToken(ctx.token);

  if (!token) {
    throw new Error("กรุณาวาง token จากเว็บหน้าบ้านก่อน");
  }

  const url = FRONT_GRAPHQL_ENDPOINTS[ctx.environment];
  if (!url) throw new Error("Unknown front GraphQL environment");

  const { res, json } = await postGraphQL(
    url,
    {
      "content-type": "application/json",
      "accept": "*/*",
      "authorization": token,
      "skiprefresh": "true",
      "platform": "web"
    },
    query,
    variables
  );

  if (!json) {
    // ถ้า Server ตอบกลับเป็น HTML ให้ดึง status มาแสดงแทน
    throw new Error(`Server ตอบกลับเป็น HTML (HTTP ${res.status}) - คาดว่าไม่มีสิทธิ์หรือ Backend ขัดข้อง`);
  }

  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

// ฟังก์ชันช่วยเช็ค error ใน payload
export function checkGraphQLErrors(responseObj) {
  if (responseObj && responseObj.successful === false) {
    const msg = (responseObj.errors || []).map(e => e.message).join(", ") || "ไม่สำเร็จ";
    throw new Error(msg);
  }
}
