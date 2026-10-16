// ==========================================
// 🎨 ANIMATION SYSTEM — เพิ่มก่อนบรรทัดอื่น
// ==========================================

// --- Ripple Effect ทุกปุ่ม ---
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const ripple = document.createElement("span");
  ripple.className = "ripple-effect";
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size / 2}px;
    top:${e.clientY - rect.top - size / 2}px;
  `;
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

// ฟังก์ชันจัดการการสลับแท็บ
function initNavigationTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // 1. นำคลาส active ออกจากปุ่มและ panel ทั้งหมด
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // 2. ใส่คลาส active ให้ปุ่มที่คลิก
      btn.classList.add('active');

      // 3. แสดง panel ที่ตรงกับ data-tab
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

// เรียกใช้งานเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
  initNavigationTabs();
});


// ===== MAGNETIC BUTTON — ตามเมาส์ =====
// ใช้กับปุ่ม Primary หลักเท่านั้น ไม่ใช้กับทุกปุ่มจะดู noisy
function initMagneticButtons() {
  const magnetBtns = document.querySelectorAll(
    "#createAndPublishBtn, #createAndPublishTopBtn, #confirmCreatePreviewBtn"
  );

  magnetBtns.forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25; // ความแรงดึง
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      btn.style.transform = "translate(0, 0) scale(1)";
      // reset transition หลัง animate เสร็จ
      btn.addEventListener("transitionend", () => {
        btn.style.transition = "";
      }, { once: true });
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.transition = "transform 0.1s ease";
    });
  });
}

// เรียกเมื่อ DOM พร้อม — ใส่ท้ายสุด app.js
window.addEventListener("load", () => {
  initMagneticButtons();
});


// --- Toast Notification ---
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.setProperty("--dur", duration + "ms");
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "💬"}</span>
    <span>${message}</span>
  `;
  toast.style.setProperty("--toast-dur", `${duration}ms`);

  // หน่วง progress bar ตาม duration
  toast.style.cssText += `--timer-dur: ${duration}ms;`;
  toast.querySelector
    ? null : null;

  container.appendChild(toast);

  // คลิกเพื่อปิดทันที
  toast.onclick = () => removeToast(toast);

  // ปิดอัตโนมัติ
  const timer = setTimeout(() => removeToast(toast), duration);
  toast._timer = timer;
}

function removeToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.add("removing");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

// --- Confetti 🎊 ---
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // สี confetti ตาม brand
  const colors = [
    "#b62e20", "#d74632", "#ff6b4a",
    "#fbbf24", "#34d399", "#60a5fa",
    "#fff", "#f9a8d4", "#a78bfa"
  ];

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: 6 + Math.random() * 8,
    h: 4 + Math.random() * 6,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 5,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 1
  }));

  let frame;
  let startTime = null;
  const DURATION = 3000;

  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.vy *= 1.01; // เร่งลง
      p.opacity = Math.max(0, 1 - elapsed / DURATION * 1.5);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (elapsed < DURATION) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  }

  frame = requestAnimationFrame(animate);
}

// ===== TYPEWRITER EFFECT สำหรับ h1 =====
function typewriterEffect(element, text, speed = 60) {
  if (!element) return;
  element.textContent = "";
  element.style.opacity = "1";
  let i = 0;
  const cursor = document.createElement("span");
  cursor.style.cssText = `
    display: inline-block;
    width: 2px; height: 1em;
    background: #b62e20;
    margin-left: 3px;
    vertical-align: middle;
    animation: cursor-blink 0.8s step-end infinite;
  `;
  element.appendChild(cursor);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  const interval = setInterval(() => {
    if (i < text.length) {
      cursor.insertAdjacentText("beforebegin", text[i]);
      i++;
    } else {
      clearInterval(interval);
      // ซ่อน cursor หลังพิมพ์เสร็จ 2 วินาที
      setTimeout(() => cursor.remove(), 2000);
    }
  }, speed);
}

// เรียกใช้หลัง DOMContentLoaded — ใส่ท้ายสุดของไฟล์ก่อน closing brace
// document.addEventListener("DOMContentLoaded", () => {
//   const h1 = document.querySelector("h1");
//   if (h1) typewriterEffect(h1, h1.textContent.trim());
// });


const $ = (id) => document.getElementById(id);

// --- Progress Bar Controller ---
const ProgressBar = {
  show(label = "กำลังดำเนินการ...") {
    const wrap = document.getElementById("progress-bar-wrap");
    const bar = document.getElementById("progress-bar");
    const lbl = document.getElementById("progress-label");
    if (!wrap) return;
    bar.style.transform = "scaleX(0)";
    lbl.textContent = label;
    wrap.classList.add("visible");
    // Animate to 20% immediately
    requestAnimationFrame(() => {
      bar.style.transform = "scaleX(0.2)";
    });
  },
  update(percent, label) {
    const bar = document.getElementById("progress-bar");
    const lbl = document.getElementById("progress-label");
    if (bar) bar.style.transform = `scaleX(${percent / 100})`;
    if (lbl && label) lbl.textContent = label;
  },
  done(label = "เสร็จแล้ว! ✅") {
    const wrap = document.getElementById("progress-bar-wrap");
    const bar = document.getElementById("progress-bar");
    const lbl = document.getElementById("progress-label");
    if (!wrap) return;
    bar.style.transform = "scaleX(1)";
    bar.style.background = "linear-gradient(90deg, #059669, #34d399)";
    if (lbl) lbl.textContent = label;
    setTimeout(() => {
      wrap.classList.remove("visible");
      bar.style.background = "";
      bar.style.transform = "scaleX(0)";
    }, 1800);
  },
  error(label = "เกิดข้อผิดพลาด ❌") {
    const bar = document.getElementById("progress-bar");
    const lbl = document.getElementById("progress-label");
    if (bar) {
      bar.style.transform = "scaleX(1)";
      bar.style.background = "linear-gradient(90deg, #b62e20, #ef4444)";
    }
    if (lbl) lbl.textContent = label;
    setTimeout(() => {
      document.getElementById("progress-bar-wrap")?.classList.remove("visible");
      if (bar) { bar.style.background = ""; bar.style.transform = "scaleX(0)"; }
    }, 2500);
  }
};


const GRAPHQL_CREATE = `
mutation createOrUpdateCampaign(
  $id: Int, $title: String, $seoSlugUrl: String, $beginDate: String, $endDate: String,
  $isPublish: Boolean, $brandId: Int, $coverImage: InputImage, $sections: [InputSection!],
  $isRequiredImage: Boolean, $maxRegister: Int, $maxQuota: Int, $isApplicationForm: Boolean,
  $startReviewDate: String, $endReviewDate: String, $startRegisterDate: String,
  $startDraftDate: String, $endDraftDate: String, $endRegisterDate: String,
  $isAllowLink: Boolean, $brands: [ListOfBrand!], $questions: [InputBrandCampaignQuestion!],
  $acceptQuestions: [InputBrandCampaignQuestion!], $categories: [InputIntId!],
  $interests: [InputIntId!], $eCatalogIds: [Int!], $startShippingDate: String,
  $suggestedItem: InputBrandCampaignSuggestedItem!, $genCodeSocialType: SocialApplicationType
) {
  createOrUpdateBrandCampaign(
    id:$id, title:$title, seoSlugUrl:$seoSlugUrl, beginDate:$beginDate, endDate:$endDate,
    isPublish:$isPublish, brandId:$brandId, coverImage:$coverImage, sections:$sections,
    isRequiredImage:$isRequiredImage, maxRegister:$maxRegister, maxQuota:$maxQuota,
    isApplicationForm:$isApplicationForm, startReviewDate:$startReviewDate,
    endReviewDate:$endReviewDate, startRegisterDate:$startRegisterDate,
    endRegisterDate:$endRegisterDate, isAllowLink:$isAllowLink, brands:$brands,
    questions:$questions, acceptQuestions:$acceptQuestions, categories:$categories,
    interests:$interests, eCatalogIds:$eCatalogIds, startDraftDate:$startDraftDate,
    endDraftDate:$endDraftDate, startShippingDate:$startShippingDate,
    suggestedItem:$suggestedItem, genCodeSocialType:$genCodeSocialType
  ) {
    successful entity { id __typename }
    errors { path message __typename }
    __typename
  }
}`;

const GRAPHQL_PUBLISH = `
mutation publishCampaign($id:Int!) {
  publish(id:$id,type:brandCampaign) {
    successful errors { path message __typename } __typename
  }
}`;

const GRAPHQL_DELETE = `
mutation deleteBrandCampaign($id:Int!) {
  deleteBrandCampaign(id:$id) {
    successful errors { message path __typename } __typename
  }
}`;

const Q_CATEGORIES = `
query getCategoriesV2($limit:Int,$offset:Int,$type:CategoryV2Type!,$filter:CategoryV2Filter) {
  categoriesV2(limit:$limit,offset:$offset,type:$type,filter:$filter) {
    id name type slug hasChild
    children { id name }
  }
}`;

const Q_BRANDS = `
query autocompleteBrands($name:String!,$limit:Int,$offset:Int,$filter:BrandFilterOption) {
  searchAllByName(name:$name) {
    brands(filter:{name:$name,filter:$filter},limit:$limit,offset:$offset) {
      id name seoSlugUrl isStore
    }
  }
}`;

const Q_COUPONS = `
query autocompleteCoupons($limit:Int,$offset:Int,$filter:CouponFilter) {
  coupons(limit:$limit,offset:$offset,filter:$filter) {
    id title seoSlugUrl
    brand { id name seoSlugUrl }
  }
}`;

let pendingCreateVariants = [];
let pendingCreatePublish = true;
let pendingCreateEnvironment = "sit";
let loadedBrands = [];
let loadedCategories = [];
let loadedCoupons = [];
const COVER_IMAGE_URLS = [
  "https://dummyimage.com/1200x800/2c3e50/ffffff",
  "https://dummyimage.com/1200x800/3498db/ffffff",
  "https://dummyimage.com/1200x800/2ecc71/ffffff",
  "https://dummyimage.com/1200x800/e74c3c/ffffff",
  "https://dummyimage.com/1200x800/9b59b6/ffffff",
  "https://dummyimage.com/1200x800/e67e22/ffffff",
  "https://dummyimage.com/1200x800/333/fff&text=Test+Image+01",
  "https://dummyimage.com/1200x800/27ae60/fff&text=SUCCESS",
  "https://dummyimage.com/1200x800/c0392b/fff&text=ERROR",
  "https://dummyimage.com/1200x800/16a085/fff&text=Banner+1200x800",
  "https://dummyimage.com/1200x800/8e44ad/fff&text=Product+Sample",

];



// เมื่อกำลัง loading ปุ่มสร้างกิจกรรม
function setButtonLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn._origText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>กำลังสร้าง...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._origText || 'สร้างกิจกรรม';
  }
}
// ใช้งาน: setButtonLoading(document.getElementById('createAndPublishBtn'), true)


function randomCoverImageUrl() {
  if (!COVER_IMAGE_URLS.length) {
    throw new Error("ยังไม่มี URL ภาพ Cover สำหรับสุ่ม");
  }

  return COVER_IMAGE_URLS[
    Math.floor(Math.random() * COVER_IMAGE_URLS.length)
  ];
}
const DEFAULT_SECTION_TEXTS = [
  "รายละเอียดกิจกรรมตัวอย่างสำหรับทดสอบ",
  "ข้อความตัวอย่างสำหรับทดสอบเนื้อหากิจกรรม",
  "ตัวอย่างเงื่อนไขและรายละเอียดกิจกรรมสำหรับทดสอบ"
];

// แทนที่ function log เดิม (บรรทัด 138-143) ทั้งหมด:
function log(msg, type = "") {
  const row = document.createElement("div");
  row.className = `log ${type}`;

  // Icon ตาม type
  const icons = { ok: "✅", error: "❌", "": "🔵" };
  const icon = icons[type] || "🔵";

  row.innerHTML = `
    <span class="log-icon">${icon}</span>
    <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
    <span class="log-msg">${escapeHtml(msg)}</span>
  `;

  // Animate เข้ามาจากบน
  row.style.animation = "log-slide-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both";

  $("log").prepend(row);

  // จำกัดไม่เกิน 100 rows
  const rows = $("log").querySelectorAll(".log");
  if (rows.length > 100) rows[rows.length - 1].remove();
}


function cleanToken(raw) {
  if (!raw) return "";
  let token = raw.trim();
  if (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, "").trim();
  }
  token = token.replace(/^["']|["']$/g, "").trim();
  return token;
}

function selectedEnvironment() {
  return document.querySelector('input[name="apiEnvironment"]:checked')?.value || "sit";
}

function tokenStorageKey() {
  return `starAdminToken:${selectedEnvironment()}`;
}

function getToken(environment = selectedEnvironment()) {
  const rawToken = environment === selectedEnvironment()
    ? $("token").value
    : localStorage.getItem(`starAdminToken:${environment}`) || "";

  return cleanToken(rawToken);
}

function endpoint(environment = selectedEnvironment()) {
  return `/api/graphql?environment=${encodeURIComponent(environment)}`;
}

async function gql(query, variables, environment = selectedEnvironment()) {
  const token = getToken(environment);

  if (!token) {
    throw new Error(`ไม่พบ Bearer Token สำหรับ ${environment.toUpperCase()}`);
  }

  console.log("[GraphQL Request]", {
    endpoint: endpoint(environment),
    environment,
    variables
  });

  const res = await fetch(endpoint(environment), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": token
    },
    body: JSON.stringify({ query, variables })
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
  console.log("[GraphQL Response]", { status: res.status, json });
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}: ${text}`);
  if (json.errors?.length) {
    const err = json.errors[0];
    const code = err.extensions?.code ? ` (${err.extensions.code})` : '';
    const path = err.path?.length ? ` [${err.path.join('.')}]` : '';
    const ext = err.extensions || {};
    const extStr = JSON.stringify(ext);
    console.error("[GraphQL Full Error]", json.errors);
    log(`[Error Detail] ${err.message}${code}${path} | Ext: ${extStr}`, "error");
    throw new Error(`[Server ตอบ: ${err.message}${code}${path}] Ext: ${extStr}`);
  }
  return json.data;
}

// หา: $(\"apiStatus\").className = `status ${online ? \"online\" : \"offline\"}`;
// ใน function setApiStatus (บรรทัด 213)
// แก้เป็น:

function setApiStatus(online) {
  const el = $("apiStatus");
  const prev = el.className;
  el.textContent = online ? "✅ API: Connected" : "🔴 API: Not connected";
  el.className = `status ${online ? "online" : "offline"}`;
  // Flash animation เมื่อสถานะเปลี่ยน
  if (prev !== el.className) {
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = "status-flip 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both";
  }
}


function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function inspectToken() {
  const token = getToken();
  const infoEl = $("tokenInfo");
  if (!infoEl) return;
  if (!token) {
    infoEl.textContent = "";
    infoEl.className = "token-info";
    return;
  }
  const payload = parseJwt(token);
  if (!payload) {
    infoEl.textContent = "⚠️ รูปแบบไม่ใช่ JWT (Token ปกติจะขึ้นต้นด้วย eyJ... และมี 3 ส่วนคั่นด้วยจุด)";
    infoEl.className = "token-info error";
    return;
  }
  const exp = payload.exp ? payload.exp * 1000 : null;
  const now = Date.now();
  if (exp && now > exp) {
    const expDate = new Date(exp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    infoEl.textContent = `❌ Token หมดอายุไปแล้วตั้งแต่เวลา ${expDate} (กรุณา Login ใน Back Office ใหม่เพื่อเอา Token ล่าสุด)`;
    infoEl.className = "token-info error";
    return;
  }
  const expStr = exp ? ` · หมดอายุ: ${new Date(exp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}` : "";
  const role = payload.role || payload.roles || "";
  const roleStr = role ? ` [${role}]` : "";
  const user = payload.email || payload.username || payload.name || payload.userId || payload.sub || "Admin";
  infoEl.textContent = `✅ Token ถูกต้อง | บัญชี: ${user}${roleStr}${expStr}`;
  infoEl.className = "token-info success";
  if ($("tokenDecoded")) {
    $("tokenDecoded").textContent = JSON.stringify(payload, null, 2);
  }
}

async function testApi() {
  try {
    const token = getToken();
    if (!token) {
      setApiStatus(false);
      inspectToken();
      return alert("กรุณาใส่ Bearer Token ใน Step 0 ก่อนกดทดสอบ API");
    }
    inspectToken();
    // ยิง query ที่ต้องผ่านระบบ Authentication จริงของ Admin ไม่ใช่แค่ introspection
    await gql(Q_CATEGORIES, { limit: 1, offset: 0, type: "brandCampaign", filter: { name: "" } });
    setApiStatus(true);
    log("GraphQL connection OK - ยืนยันสิทธิ์ Admin และ Token ใช้งานได้จริง", "ok");
    alert("เชื่อมต่อ API สำเร็จ! Token ถูกต้องและยืนยันสิทธิ์ Admin ผ่านเรียบร้อย");
  } catch (e) {
    setApiStatus(false);
    inspectToken();
    log(`API error: ${e.message}`, "error");
    alert(`เชื่อมต่อไม่สำเร็จ: ${e.message}`);
  }
}

function flattenCategories(groups) {
  const list = [];
  for (const group of groups || []) {
    list.push({ id: group.id, name: group.name });
    for (const child of group.children || []) list.push({ id: child.id, name: child.name });
  }
  return list;
}

function fillCategorySelect(groups) {
  const data = groups || [];
  loadedCategories = flattenCategories(data);
  const html = [`<option value="">-- เลือก Category --</option>`];
  for (const group of data) {
    const children = group.children || [];
    if (!children.length) {
      html.push(`<option value="${group.id}">${escapeHtml(group.name)}</option>`);
      continue;
    }
    html.push(`<optgroup label="${escapeHtml(group.name)}">`);
    html.push(`<option value="${group.id}">${escapeHtml(group.name)}</option>`);
    for (const child of children) {
      html.push(`<option value="${child.id}">${escapeHtml(child.name)}</option>`);
    }
    html.push(`</optgroup>`);
  }
  $("categorySelect").innerHTML = html.join("");
}

async function loadCategories(environment = selectedEnvironment()) {
  const data = await gql(
    Q_CATEGORIES,
    { limit: 50, offset: 0, type: "brandCampaign", filter: { name: "" } },
    environment
  );
  fillCategorySelect(data.categoriesV2 || []);
  log(`โหลด Category ${loadedCategories.length} รายการ`, "ok");
}
async function searchBrands() {
  const name = $("brandSearch").value.trim();
  const data = await gql(Q_BRANDS, { name, limit: 15, offset: 0, filter: "publishOnly" });
  loadedBrands = data.searchAllByName?.brands || [];
  $("brandSelect").innerHTML = `<option value="">-- เลือก Brand --</option>` +
    loadedBrands.map(x =>
      `<option value="${x.id}">${escapeHtml(x.name)}</option>`
    ).join("");
  log(`ค้นหา Brand "${name || 'ทั้งหมด'}" ได้ ${loadedBrands.length} รายการ`, "ok");
}


async function loadAllOptions(environment = selectedEnvironment()) {
  log("กำลังดึง Category, Brand และ Coupon จากระบบ " + environment + "...");
  try {
    await loadCategories(environment);

    // ดึง Coupon จาก SIT
    const cData = await gql(
      Q_COUPONS,
      { filter: { name: "" }, limit: 15, offset: 0 },
      environment
    ).catch(() => ({}));
    loadedCoupons = cData.coupons || [];

    // รวม Brands จาก Coupons
    const brandMap = new Map();

    for (const coupon of loadedCoupons) {
      const brand = coupon.brand;
      if (brand?.id) {
        brandMap.set(brand.id, {
          id: brand.id,
          name: brand.name,
          seoSlugUrl: brand.seoSlugUrl
        });
      }
    }

    const bData = await gql(
      Q_BRANDS,
      { name: "", limit: 15, offset: 0, filter: "publishOnly" },
      environment
    ).catch(() => ({}));

    const extraBrands = bData.searchAllByName?.brands || [];
    for (const brand of extraBrands) {
      if (brand.id) {
        brandMap.set(brand.id, {
          id: brand.id,
          name: brand.name,
          seoSlugUrl: brand.seoSlugUrl
        });
      }
    }

    loadedBrands = [...brandMap.values()];
    $("brandSelect").innerHTML = `<option value="">-- เลือก Brand --</option>` +
      loadedBrands.map(x =>
        `<option value="${x.id}">${escapeHtml(x.name)}</option>`
      ).join("");

    // Auto-select coupon และ brand ที่ตรงกันอัตโนมัติ
    if (loadedCoupons.length > 0) {
      const first = loadedCoupons[0];
      if (first.brand?.id) {
        $("brandSelect").value = first.brand.id;
      }
    } else if (loadedBrands.length > 0 && !$("brandSelect").value) {
      $("brandSelect").value = loadedBrands[0].id;
    }

    if (loadedCategories.length > 0 && !$("categorySelect").value) {
      $("categorySelect").value = loadedCategories[0].id;
    }

    setApiStatus(true);
    log(`โหลดตัวเลือกสำเร็จ: Category ${loadedCategories.length}, Brand ${loadedBrands.length}, Coupon ${loadedCoupons.length} รายการ`, "ok");
    return true;
  } catch (e) {
    log(`โหลดตัวเลือกไม่สำเร็จ: ${e.message}`, "error");
    alert(`โหลดตัวเลือกไม่สำเร็จ: ${e.message}`);
    return false;
  }
}

const loadedOptionsEnvironments = new Set();
let optionsLoading = false;
let pendingOptionsEnvironment = null;

async function loadOptionsAutomatically(force = false) {
  const environment = selectedEnvironment();

  if (!getToken(environment)) return;

  if (!force && loadedOptionsEnvironments.has(environment)) return;

  if (optionsLoading) {
    pendingOptionsEnvironment = environment;
    return;
  }

  optionsLoading = true;

  try {
    const loaded = await loadAllOptions(environment);

    if (loaded) {
      loadedOptionsEnvironments.add(environment);
    }
  } finally {
    optionsLoading = false;

    const nextEnvironment = pendingOptionsEnvironment;
    pendingOptionsEnvironment = null;

    if (nextEnvironment && nextEnvironment !== environment) {
      void loadOptionsAutomatically(true);
    } else if (selectedEnvironment() !== environment) {
      void loadOptionsAutomatically(true);
    }
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}
function pad(n) { return String(n).padStart(2, "0"); }
function localInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function ms(id) {
  const v = $(id).value;
  if (!v) return null;
  return String(new Date(v).getTime());
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }


const TIMELINE_OFFSETS = {
  beginDate: 0,
  startRegisterDate: 0,
  endRegisterDate: 5,
  startShippingDate: 6,
  startDraftDate: 7,
  endDraftDate: 12,
  startReviewDate: 13,
  endReviewDate: 18,
  endDate: 18
};

const REGISTER_START_OFFSET_BY_STATUS = {
  beforeRegister: 1,
  registering: -2,
  registrationClosed: -5,
  draft: -8,
  review: -14,
  ended: -19
};

function applyStatusTimeline() {
  const status = $("campaignStatus").value;
  if (!status) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registerStart = addDays(
    today,
    REGISTER_START_OFFSET_BY_STATUS[status]
  );

  for (const [fieldId, offset] of Object.entries(TIMELINE_OFFSETS)) {
    $(fieldId).value = localInput(addDays(registerStart, offset));
  }
}

// คำนวณ variables วันที่ทั้งหมดจากสถานะที่ต้องการ
// ใช้หลักการเดียวกับ applyStatusTimeline() แต่ return เป็น object แทนการ set DOM
function buildDatesByStatus(status) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registerStartOffset = REGISTER_START_OFFSET_BY_STATUS[status];
  if (registerStartOffset === undefined) {
    throw new Error(`ไม่รู้จักสถานะ: ${status}`);
  }

  const registerStart = addDays(today, registerStartOffset);

  // คำนวณวันที่ทุก field โดยใช้ TIMELINE_OFFSETS (ms = milliseconds timestamp)
  const result = {};
  for (const [fieldId, offset] of Object.entries(TIMELINE_OFFSETS)) {
    const date = addDays(registerStart, offset);
    result[fieldId] = String(date.getTime());
  }
  return result;
  // ผลลัพธ์ตัวอย่าง:
  // {
  //   beginDate: "1790000000000",
  //   startRegisterDate: "1790000000000",
  //   endRegisterDate: "1790432000000",
  //   ...
  // }
}

async function changeHistoryStatus(index) {
  // 1. ดึง item จาก History
  const history = getHistory();
  const item = history[index];

  if (!item || item.status !== "success" || !item.id) {
    alert("ไม่พบรายการหรือกิจกรรมนี้สร้างไม่สำเร็จ");
    return;
  }

  const environment = item.environment || selectedEnvironment();

  // 2. ตรวจสอบ Token
  if (!getToken(environment)) {
    alert(`ไม่พบ Bearer Token สำหรับ ${environment.toUpperCase()}`);
    return;
  }

  // 3. เปิด Dialog เลือกสถานะ (ใช้ dialog เดิมที่มีอยู่)
  //    เก็บ index และ environment ไว้ใน dialog เพื่อใช้ตอนกด "ยืนยัน"
  const dialog = document.getElementById("campaignStatusDialog");
  dialog.dataset.historyIndex = index;
  dialog.dataset.historyMode = "changeStatus"; // ← flag บอกว่าใช้ dialog ในโหมด "เปลี่ยนสถานะ history"
  dialog.showModal();
}


function sectionsFromUI() {
  return [...document.querySelectorAll(".section-row")]
    .map(row => ({
      type: "text",
      text: { type: "text", value: row.querySelector("textarea").value }
    }))
    .filter(section => {
      const value = section.text.value.trim();
      return value && !DEFAULT_SECTION_TEXTS.includes(value);
    });
}

function generatedActivitySections(activity) {
  const brandId = activity.brandId;
  const categoryId = activity.categories?.[0]?.id;

  const brand = loadedBrands.find(
    item => Number(item.id) === Number(brandId)
  );
  const category = loadedCategories.find(
    item => Number(item.id) === Number(categoryId)
  );

  const socialLabels = {
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok"
  };

  const socialType = activity.genCodeSocialType
    ? socialLabels[activity.genCodeSocialType] || activity.genCodeSocialType
    : "ไม่มี";

  const content = [
    `ชื่อกิจกรรม: ${activity.title || "-"}`,
    `SEO Slug: ${activity.seoSlugUrl || "-"}`,
    `Brand: ${brand?.name || "-"}`,
    `Category: ${category?.name || "-"}`,
    `Social Gencode: ${socialType}`
  ].join("\n");

  return [{
    type: "text",
    text: { type: "text", value: content }
  }];
}

function randomSectionText() {
  const index = Math.floor(Math.random() * DEFAULT_SECTION_TEXTS.length);
  return DEFAULT_SECTION_TEXTS[index];
}

function addSection(value = randomSectionText()) {
  const row = document.createElement("div");
  row.className = "section-row";
  row.innerHTML = `
    <select name="sectionType[]"><option value="text">text</option></select>
    <textarea name="sectionText[]" placeholder="รายละเอียดกิจกรรม">${escapeHtml(value)}</textarea>
    <button class="secondary remove-section">ลบ</button>`;
  row.querySelector(".remove-section").onclick = () => row.remove();
  $("sections").appendChild(row);
}
function selectedInt(selectId, inputId) {
  const raw = $(inputId).value || $(selectId).value;
  return raw ? Number(raw) : null;
}
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-+|-+$/g, "");
}

function getBaseForm() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const brandId = Number($("brandSelect").value) || null;
  const categoryId = Number($("categorySelect").value) || null;
  if (mode === "manual" && !brandId) {
    throw new Error("กรุณาเลือก Brand สำหรับโหมด Manual");
  }
  if (!categoryId) throw new Error("กรุณาเลือก Category");
  const requiredDateIds = [
    "beginDate",
    "endDate",
    "startRegisterDate",
    "endRegisterDate",
    "startShippingDate",
    "startDraftDate",
    "endDraftDate",
    "startReviewDate",
    "endReviewDate"
  ];

  const missingDates = requiredDateIds.filter(id => !$(id).value);

  if (missingDates.length) {
    throw new Error("กรุณาเลือกสถานะกิจกรรม หรือกรอกวันที่ให้ครบทุกช่อง");
  }
  const title = $("title").value.trim();
  const slug = $("slug").value.trim();
  const cover = $("coverImage").value.trim();

  return {
    title, seoSlugUrl: slug, brandId,
    coverImage: { imgPath: cover, width: 1200, height: 630 },
    sections: sectionsFromUI(),
    beginDate: ms("beginDate"), endDate: ms("endDate"),
    startReviewDate: ms("startReviewDate"), endReviewDate: ms("endReviewDate"),
    startRegisterDate: ms("startRegisterDate"), endRegisterDate: ms("endRegisterDate"),
    startShippingDate: ms("startShippingDate"),
    startDraftDate: ms("startDraftDate"), endDraftDate: ms("endDraftDate"),
    maxRegister: Number($("maxRegister").value || 0),
    maxQuota: Number($("maxQuota").value || 0),
    isApplicationForm: true,
    isAllowLink: true,
    brands: brandId ? [{ id: brandId }] : [],
    questions: [],
    acceptQuestions: [],
    categories: [{ id: categoryId }],
    interests: null,
    eCatalogIds: null,
    suggestedItem: { type: "coupon", entityId: null },
    genCodeSocialType: $("genCodeSocialType").value || null
  };
}

// รายการสายที่ใช่ทั้งหมด (จาก API categoriesV2)
const ALL_CATEGORIES = [
  { id: 2275, name: "ความงามและสุขภาพ" },
  { id: 2277, name: "แฟชั่นและช้อปปิ้ง" },
  { id: 2278, name: "อาหารและเครื่องดื่ม" },
  { id: 2279, name: "การเดินทางและขนส่ง" },
  { id: 2280, name: "ท่องเที่ยว" },
  { id: 2300, name: "สัตว์เลี้ยง" },
  { id: 2301, name: "แม่และเด็ก" },
  { id: 2302, name: "บ้านและสวน" },
  { id: 2303, name: "เทคโนโลยี" },
  { id: 2304, name: "อีเวนต์และกิจกรรม" },
  { id: 2305, name: "กีฬา" },
  { id: 2306, name: "การศึกษา" },
  { id: 2309, name: "สายคาเฟ่ห้ามพลาด" },
];

// รายการจังหวัดทั้งหมด (จาก API getProvinces)
const ALL_PROVINCES = [
  "กระบี่","กรุงเทพมหานคร","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี",
  "ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด",
  "ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี",
  "นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี",
  "พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์",
  "แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง",
  "ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล",
  "สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย",
  "สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ",
  "อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
];

// วันเวลาว่างรับงาน (ลำดับนี้ = ลำดับที่แสดงบนเว็บ)
const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const ALL_TIME_SLOTS = ["slot_09_12", "slot_12_14", "slot_14_17", "slot_17_late"];

// หัวข้อย่อยของ "เกี่ยวกับคุณ"  (ready: false = ยังไม่มี API ทำปุ่มไว้ก่อน)
const ABOUT_SUB_ITEMS = [
  { key: "creatorAvatar",   label: "รูปโปรไฟล์ครีเอเตอร์", ready: false },
  { key: "caption",         label: "แนะนำตัว",            ready: true  },
  { key: "profileImages",   label: "รูปของคุณ",           ready: true  },
  { key: "portfolioImages", label: "รูปผลงาน",            ready: true  },
  { key: "portfolioVideos", label: "วิดีโอผลงาน",          ready: true  },
  { key: "nickname",        label: "ชื่อเล่น",             ready: true },
];

// คลังรูป (จากไฟล์ API ที่แนบ + รูปเดิมที่ใช้อยู่)
const MOCK_IMAGE_POOL = [
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator0jpeg-xgabi4tbdlpf.jpg",
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator1jpeg-gk26kqo4et6p.jpg",
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/14/chatgptimage302569152922-h8nvpcsp3om0.jpg",
];

// คลังวิดีโอ (วิดีโอ + thumbnail ต้องเป็นคู่กัน)
const MOCK_VIDEO_POOL = [
  {
    videoPath: "https://media.salehere.co.th/uat-videos/2026/10/15/s3uploads3uploadimg0482-3b6lk1hq1dly.mp4",
    thumbnail: "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator0jpeg-fckotun5qqwe.jpg",
  },
  {
    videoPath: "https://media.salehere.co.th/uat-videos/2026/10/14/magicalfestivalcelebration-njhcklm8oe1t.mp4",
    thumbnail: "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/14/thumb1-piw0iu4ysvtt.jpg",
  },
];

// คลังชื่อเล่น (ผลไม้ + สัตว์)
const MOCK_NICKNAME_POOL = [
  // ผลไม้
  "ส้ม", "กล้วย", "มะม่วง", "แตงโม", "สตรอว์เบอร์รี", "องุ่น", "มะนาว", "ลำไย", "มังคุด", "เงาะ",
  // สัตว์
  "ไก่", "เป็ด", "หมู", "แมว", "หมา", "กระต่าย", "หมี", "ปลาทอง", "นกฮูก", "เพนกวิน",
];


function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  const copy = [...arr];                 // ก๊อปก่อน จะได้ไม่แก้ array ต้นฉบับ
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // สุ่มตำแหน่ง 0..i
    [copy[i], copy[j]] = [copy[j], copy[i]];       // สลับตำแหน่ง i กับ j
  }
  return copy;
}

// สุ่มเลือก min..max ตัวแบบไม่ซ้ำ โดยคงลำดับเดิมของ arr ไว้
function randomSubsetInOrder(arr, min, max) {
  const count = randomInt(min, Math.min(max, arr.length));
  const picked = new Set(shuffle(arr).slice(0, count));
  return arr.filter(item => picked.has(item));
}

// สุ่ม 1-3 รูป (ซ้ำได้) เป็นรูปแบบ InputCreatorImage
function randomImageItems() {
  const count = randomInt(1, 3);
  return Array.from({ length: count }, (_, i) => ({
    image: { imgPath: randomChoice(MOCK_IMAGE_POOL) },
    seq: i + 1,
  }));
}

// สุ่ม 1-3 วิดีโอ (ซ้ำได้) เป็นรูปแบบของ portfolio.videos
function randomVideoItems() {
  const count = randomInt(1, 3);
  return Array.from({ length: count }, (_, i) => {
    const v = randomChoice(MOCK_VIDEO_POOL);
    return {
      video: { videoPath: v.videoPath },
      videoThumbnail: { imgPath: v.thumbnail },
      seq: i + 1,
    };
  });
}

function randomCouponId() {
  const coupons = loadedCoupons.filter(coupon => Number(coupon.id) > 0);

  if (!coupons.length) {
    throw new Error("ไม่พบ Coupon สำหรับสุ่ม กรุณากดโหลด Brand / Category / Coupon");
  }

  return Number(randomChoice(coupons).id);
}
function buildVariants() {
  const base = getBaseForm();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const count = mode === "quick"
    ? 1
    : Math.min(50, Math.max(1, Number($("count").value) || 1));
  if (mode === "manual") {
    const selectedBrand = loadedBrands.find(
      brand =>
        Number(brand.id) === base.brandId &&
        brand.seoSlugUrl?.trim()
    );

    if (!selectedBrand) {
      throw new Error("Brand ที่เลือกไม่มี seoSlugUrl กรุณาโหลด Brand ใหม่");
    }

    const brandSlug = selectedBrand.seoSlugUrl.trim();

    if (!base.title) {
      base.title = `EP.${Date.now()}-${brandSlug}`;
    }

    if (!base.seoSlugUrl) {
      base.seoSlugUrl = `${brandSlug}-${Date.now()}`;
    }
    base.suggestedItem.entityId = randomCouponId();

    if (!base.coverImage.imgPath) {
      base.coverImage.imgPath = randomCoverImageUrl();
    }

    if (!base.sections.length) {
      base.sections = generatedActivitySections(base);
    }

    return [base];
  }

  const brandsWithSlug = loadedBrands.filter(
    brand => brand.seoSlugUrl?.trim()
  );

  if (!brandsWithSlug.length) {
    throw new Error("ไม่พบ Brand ที่มี seoSlugUrl กรุณาโหลด Brand ใหม่");
  }

  const variants = [];

  for (let i = 0; i < count; i++) {
    const copy = structuredClone(base);
    if (!copy.coverImage.imgPath) {
      copy.coverImage.imgPath = randomCoverImageUrl();
    }
    const stamp = Date.now() + i;
    copy.suggestedItem.entityId = randomCouponId();
    const randomBrand = randomChoice(brandsWithSlug);

    const brandSlug = randomBrand.seoSlugUrl.trim();

    copy.brandId = Number(randomBrand.id);
    copy.brands = [{ id: Number(randomBrand.id) }];

    if (!base.title) {
      copy.title = `EP.${stamp}-${brandSlug}`;
    } else {
      copy.title = `${base.title} - QA ${i + 1}`;
    }

    if (!base.seoSlugUrl) {
      copy.seoSlugUrl = `${brandSlug}-${stamp}`;
    } else {
      copy.seoSlugUrl = `${slugify(base.seoSlugUrl)}-${stamp}-${i + 1}`;
    }

    copy.brandId = Number(randomBrand.id);
    copy.brands = [{ id: Number(randomBrand.id) }];

    if (!base.title) {
      copy.title = `EP.${stamp}-${randomBrand.seoSlugUrl.trim()}`;
    } else {
      copy.title = `${base.title} - QA ${i + 1}`;
    }

    if (mode === "quick") {
      if (!loadedCategories.length) {
        throw new Error("ไม่พบ Category สำหรับสุ่ม กรุณาโหลดตัวเลือกใหม่");
      }

      copy.title = `EP.${stamp}-${brandSlug}`;
      copy.seoSlugUrl = `${slugify(brandSlug)}-${stamp}`;
      copy.coverImage.imgPath = randomCoverImageUrl();
      copy.suggestedItem.entityId = randomCouponId();
      copy.maxRegister = randomInt(1, 300);
      copy.maxQuota = randomInt(1, Math.max(1, copy.maxRegister));

      const randomCategory = randomChoice(loadedCategories);
      copy.categories = [{ id: Number(randomCategory.id) }];

      copy.genCodeSocialType = randomChoice([
        null,
        "facebook",
        "instagram",
        "tiktok"
      ]);

      copy.sections = generatedActivitySections(copy);
    }

    if (mode === "bulk") {
      copy.suggestedItem.entityId = randomCouponId();

    }

    if (mode === "random") {

      copy.maxRegister = randomInt(1, 300);
      copy.maxQuota = randomInt(1, Math.max(1, copy.maxRegister));

      copy.suggestedItem.entityId = randomCouponId();

      if (loadedCategories.length) {
        const randomCategory = randomChoice(loadedCategories);
        copy.categories = [{ id: Number(randomCategory.id) }];
      }

      const beginDate = addDays(new Date(), i + 1);
      beginDate.setHours(9, 0, 0, 0);

      const endDate = addDays(beginDate, randomInt(7, 45));

      copy.beginDate = String(beginDate.getTime());
      copy.endDate = String(endDate.getTime());
      copy.startRegisterDate = String(addDays(beginDate, 1).getTime());
      copy.endRegisterDate = String(
        addDays(beginDate, randomInt(3, 7)).getTime()
      );
      copy.startShippingDate = String(addDays(beginDate, 8).getTime());
      copy.startDraftDate = String(addDays(beginDate, 9).getTime());
      copy.endDraftDate = String(
        addDays(
          beginDate,
          Math.max(10, Math.floor((endDate - beginDate) / 86400000) - 1)
        ).getTime()
      );
      copy.startReviewDate = String(addDays(beginDate, 10).getTime());
      copy.endReviewDate = String(endDate.getTime());
    }

    if (mode === "boundary") {
      const cases = [
        { suffix: "min", maxRegister: 0, maxQuota: 0 },
        { suffix: "small", maxRegister: 1, maxQuota: 1 },
        { suffix: "normal", maxRegister: 150, maxQuota: 120 },
        { suffix: "large", maxRegister: 9999, maxQuota: 9999 },
        { suffix: "long-title", maxRegister: 50, maxQuota: 50 }
      ];

      const boundaryCase = cases[i % cases.length];

      copy.maxRegister = boundaryCase.maxRegister;
      copy.maxQuota = boundaryCase.maxQuota;
    }

    if (!copy.sections.length) {
      copy.sections = generatedActivitySections(copy);
    }

    variants.push(copy);
  }

  return variants;
}

function payloadFor(v, publish = false) {
  return {
    ...v,
    isPublish: publish,
    isRequiredImage: false
  };
}

function buildPreview() {
  try {
    applyStatusTimeline();
    const variants = buildVariants();
    $("payloadPreview").textContent = JSON.stringify(variants.length === 1 ? payloadFor(variants[0], false) : variants, null, 2);
    log(`สร้าง Preview ${variants.length} payload`, "ok");
  } catch (e) {
    $("payloadPreview").textContent = e.message; log(e.message, "error");
  }
}

async function createOne(v, publish, environment) {
  const payload = payloadFor(v, false);
  log(`กำลังยิงสร้าง: ${v.title} (Brand #${v.brandId}, Category #${v.categories?.[0]?.id})...`);

  const data = await gql(GRAPHQL_CREATE, payload, environment);
  const result = data?.createOrUpdateBrandCampaign;
  if (!result?.successful) {
    console.error("[Create Campaign Response]", result);
    const detail = (result?.errors || []).map(x => `${x.path ? '[' + x.path + '] ' : ''}${x.message}`).join(" | ") || "Create failed";
    if (detail.includes("เข้าสู่ระบบ") || detail.toLowerCase().includes("unauthorized")) {
      setApiStatus(false);
      throw new Error(`[Server ตอบ: ${detail}] สิทธิ์ของผู้ใช้ไม่สามารถสร้างกิจกรรมแบรนด์นี้ได้ หรือ Token ไม่มีสิทธิ์ Admin`);
    }
    throw new Error(detail);
  }
  const id = result.entity?.id;
  if (publish && id) {
    const p = await gql(
      GRAPHQL_PUBLISH,
      { id: Number(id) },
      environment
    );
    const pr = p.publish;
    if (!pr?.successful) throw new Error((pr?.errors || []).map(x => x.message).join(" | ") || "Publish failed");
  }
  return { id: Number(id), published: !!publish };
}

function openCreatePreview(publish = true) {
  try {
    applyStatusTimeline();

    pendingCreatePublish = publish;
    pendingCreateEnvironment = selectedEnvironment();
    pendingCreateVariants = buildVariants();

    const statusText = campaignStatusText($("campaignStatus").value);

    $("createPreviewTableBody").innerHTML = pendingCreateVariants
      .map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <input
              class="preview-title-input"
              data-index="${index}"
              value="${escapeHtml(item.title)}"
            />
          </td>
          <td>
            <input
              class="preview-slug-input"
              data-index="${index}"
              value="${escapeHtml(item.seoSlugUrl || "")}"
            />
          </td>
          <td>${item.brandId || "-"}</td>
          <td>${item.categories?.[0]?.id || "-"}</td>
          <td>${statusText}</td>
        </tr>
      `)
      .join("");

    $("createPreviewDialog").showModal();
  } catch (e) {
    log(e.message, "error");
    alert(e.message);
  }
}

async function confirmCreateFromPreview() {
  if (!pendingCreateVariants.length) {
    alert("ไม่พบข้อมูลที่จะสร้าง");
    return;
  }

  document.querySelectorAll(".preview-title-input").forEach(input => {
    const index = Number(input.dataset.index);
    pendingCreateVariants[index].title = input.value.trim();
  });

  document.querySelectorAll(".preview-slug-input").forEach(input => {
    const index = Number(input.dataset.index);
    pendingCreateVariants[index].seoSlugUrl = input.value.trim();
  });

  $("createPreviewDialog").close();

  await createAllFromVariants(
    pendingCreateVariants,
    pendingCreatePublish,
    pendingCreateEnvironment
  );
}

// แทนที่ function createAllFromVariants เดิม (บรรทัด 982-1022):
async function createAllFromVariants(variants, publish, environment) {
  $("createAndPublishBtn").disabled = true;

  // 🎬 เริ่ม Progress Bar
  ProgressBar.show(`กำลังสร้าง 0/${variants.length} กิจกรรม...`);

  let ok = 0;

  try {
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];

      // อัปเดต Progress
      const pct = Math.round(((i) / variants.length) * 90) + 5;
      ProgressBar.update(pct, `สร้างกิจกรรม ${i + 1}/${variants.length}: ${v.title || "..."}`);

      try {
        const r = await createOne(v, publish, environment);

        saveHistory({
          ...v, id: r.id, environment,
          status: "success", published: r.published,
          campaignStatus: $("campaignStatus").value
        });
        ok++;
        log(`สร้างสำเร็จ ID=${r.id} | ${v.title}`, "ok");

        // Flash row ใหม่ใน history
        renderHistory();
        highlightFirstHistoryRow();

      } catch (e) {
        saveHistory({
          ...v, id: null, environment,
          status: "failed", error: e.message,
          campaignStatus: $("campaignStatus").value
        });
        log(`สร้างไม่สำเร็จ | ${v.title} | ${e.message}`, "error");
      }
    }

    renderHistory();

    if (ok > 0) {
      // 🎉 สำเร็จ
      ProgressBar.done(`สร้างสำเร็จ ${ok}/${variants.length} กิจกรรม! 🎉`);
      showToast(`✅ สร้างสำเร็จ ${ok}/${variants.length} กิจกรรม`, "success", 4000);
      if (ok === variants.length) launchConfetti(); // ยิง confetti!
    } else {
      ProgressBar.error(`สร้างไม่สำเร็จทั้งหมด`);
      showToast(`❌ สร้างไม่สำเร็จ กรุณาตรวจ API Log`, "error");
    }

  } finally {
    $("createAndPublishBtn").disabled = false;
  }
}




async function createAll(publish = true) {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  let resetQuickToBulk = false;

  try {


    if (mode === "quick") {
      $("campaignStatus").value = "registering";
      $("campaignStatusLabel").textContent = "เปิดลงทะเบียน";

      const registeringOption = document.querySelector(
        'input[name="campaignStatusOption"][value="registering"]'
      );

      if (registeringOption) {
        registeringOption.checked = true;
      }
    }

    applyStatusTimeline();
    const environment = selectedEnvironment();
    const variants = buildVariants();
    if (!confirm(`กำลังจะสร้าง ${variants.length} กิจกรรม${publish ? " และ Publish" : ""} ดำเนินการหรือไม่?`)) return;
    resetQuickToBulk = mode === "quick";
    $("createAndPublishBtn").disabled = true;

    $("createAndPublishBtn").disabled = true;
    let ok = 0;
    for (const v of variants) {
      try {
        const r = await createOne(v, publish, environment);
        saveHistory({
          ...v,
          id: r.id,
          environment,
          status: "success",
          published: r.published,
          campaignStatus: $("campaignStatus").value
        });
        ok++; log(`สร้างสำเร็จ ID=${r.id} | ${v.title}`, "ok");
      } catch (e) {
        saveHistory({
          ...v,
          id: null,
          environment,
          status: "failed",
          error: e.message
        });
        log(`สร้างไม่สำเร็จ | ${v.title} | ${e.message}`, "error");
      }
    }
    renderHistory();
    alert(`เสร็จแล้ว: สำเร็จ ${ok}/${variants.length}`);
  } catch (e) {
    log(e.message, "error");
    alert(e.message);
  } finally {
    $("createAndPublishBtn").disabled = false;

    if (resetQuickToBulk) {
      const bulkMode = document.querySelector('input[name="mode"][value="bulk"]');
      bulkMode.checked = true;

      document.querySelectorAll(".mode").forEach(modeOption => {
        modeOption.classList.toggle("active", modeOption.contains(bulkMode));
      });

      $("modeOptionsLabel").textContent = "Bulk";
      $("count").value = 5;
    }
  }
}

function getHistory() { return JSON.parse(localStorage.getItem("starHistory") || "[]"); }
function saveHistory(item) {
  const h = getHistory(); h.unshift({ ...item, createdAt: new Date().toISOString() });
  localStorage.setItem("starHistory", JSON.stringify(h.slice(0, 100)));
}

function campaignStatusText(status) {
  const labels = {
    beforeRegister: "ยังไม่เปิดลงทะเบียน",
    registering: "เปิดลงทะเบียน",
    registrationClosed: "หมดเวลาลงทะเบียน",
    draft: "ถึงเวลาส่งดราฟต์",
    review: "ถึงเวลาส่งลิงก์รีวิว",
    ended: "สิ้นสุดกิจกรรม"
  };

  return labels[status] || "-";
}

function renderHistory() {
  const environment = selectedEnvironment();

  const visibleItems = getHistory()
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.environment === environment);

  $("history").innerHTML = visibleItems.length
    ? visibleItems.map(({ item, index }) => {
      const canDelete = item.status === "success" && item.id;

      return `
          <div class="history-row">
            <input
              class="history-select"
              type="checkbox"
              data-index="${index}"
              aria-label="เลือกกิจกรรม ID ${item.id || "-"}"
              ${canDelete ? "" : "disabled"}
            />
            <div>
              <b>${escapeHtml(item.title)}</b>
              <div class="hint">
                ID: ${item.id || "-"} · slug: ${escapeHtml(item.seoSlugUrl || "")}
              </div>
            </div>
            <span class="badge ${item.status === "success" ? "ok" : "fail"}">
              ${item.status === "success" ? "SUCCESS" : "FAILED"}
            </span>
            <span class="history-campaign-status">${campaignStatusText(item.campaignStatus)}</span>
            ${item.status === "success" && item.id
          ? `<div class="history-actions">
       <button class="secondary change-status-btn" data-index="${index}">🔄 เปลี่ยนสถานะ</button>
       <button class="secondary mark-deleted" data-index="${index}">${item.deletedInBackOffice ? "ลบแล้ว ✓" : "ลบแล้วใน Back Office"}</button>
     </div>`
          : ""}

          </div>
        `;
    }).join("")
    : `<div class="hint">ยังไม่มีรายการใน ${environment.toUpperCase()}</div>`;

  $("selectAllHistory").checked = false;
  $("selectAllHistory").onchange = () => {
    document.querySelectorAll(".history-select:not(:disabled)")
      .forEach(checkbox => {
        checkbox.checked = $("selectAllHistory").checked;
      });
  };

  $("deleteSelectedHistoryBtn").onclick = deleteSelectedHistory;
  document.querySelectorAll(".mark-deleted").forEach(button => {
    button.onclick = () =>
      markHistoryDeleted(Number(button.dataset.index));
  });
  // ผูก event กับปุ่ม "เปลี่ยนสถานะ" (วางต่อจาก mark-deleted event binding)
  document.querySelectorAll(".change-status-btn").forEach(button => {
    button.onclick = () => changeHistoryStatus(Number(button.dataset.index));
  });

}

// ใส่หลัง renderHistory function
function highlightFirstHistoryRow() {
  // หน่วงเล็กน้อยให้ DOM render ก่อน
  requestAnimationFrame(() => {
    const firstRow = document.querySelector(".history-row");
    if (!firstRow) return;
    firstRow.classList.remove("flash-new");
    void firstRow.offsetWidth; // force reflow
    firstRow.classList.add("flash-new");
    firstRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}


function markHistoryDeleted(index) {
  const history = getHistory();
  const item = history[index];

  if (!item || item.status !== "success" || !item.id) {
    return;
  }

  item.deletedInBackOffice = !item.deletedInBackOffice;
  localStorage.setItem("starHistory", JSON.stringify(history));
  renderHistory();
}

async function deleteSelectedHistory() {
  const environment = selectedEnvironment();
  const indexes = [...document.querySelectorAll(".history-select:checked")]
    .map(checkbox => Number(checkbox.dataset.index))
    .sort((a, b) => b - a);

  if (!indexes.length) {
    alert("กรุณาเลือกกิจกรรมที่ต้องการลบ");
    return;
  }

  if (!getToken(environment)) {
    alert(`ไม่พบ Bearer Token สำหรับ ${environment.toUpperCase()}`);
    return;
  }

  if (!confirm(`ลบกิจกรรมที่เลือก ${indexes.length} รายการจาก ${environment.toUpperCase()}?`)) {
    return;
  }

  let deleted = 0;
  let failed = 0;

  for (const index of indexes) {
    const history = getHistory();
    const item = history[index];

    if (!item || item.environment !== environment || !item.id) {
      failed++;
      continue;
    }

    try {
      const data = await gql(
        GRAPHQL_DELETE,
        { id: Number(item.id) },
        environment
      );

      const result = data?.deleteBrandCampaign;
      if (!result?.successful) {
        throw new Error(
          (result?.errors || []).map(error => error.message).join(" | ") ||
          "Delete failed"
        );
      }

      const updatedHistory = getHistory();
      updatedHistory.splice(index, 1);
      localStorage.setItem("starHistory", JSON.stringify(updatedHistory));
      deleted++;
    } catch (error) {
      failed++;
      log(`ลบกิจกรรม ID ${item.id} ไม่สำเร็จ: ${error.message}`, "error");
    }
  }

  renderHistory();
  alert(`ลบสำเร็จ ${deleted} รายการ${failed ? ` · ลบไม่สำเร็จ ${failed} รายการ ดูรายละเอียดใน API Log` : ""}`);
}
async function deleteById(id, index) {
  const history = getHistory();
  const item = history[index];

  if (!item) {
    alert("ไม่พบรายการใน History");
    return;
  }

  // History เก่าที่ไม่มี environment จะใช้ radio ที่เลือกอยู่
  const environment = item.environment || selectedEnvironment();

  if (!getToken(environment)) {
    alert(`ไม่พบ Bearer Token สำหรับ ${environment.toUpperCase()}`);
    return;
  }

  if (!confirm(`ลบกิจกรรม ID ${id} จาก ${environment.toUpperCase()}?`)) {
    return;
  }

  try {
    const data = await gql(
      GRAPHQL_DELETE,
      { id },
      environment
    );

    const result = data.deleteBrandCampaign;

    if (!result?.successful) {
      throw new Error(
        (result?.errors || []).map(error => error.message).join(" | ") ||
        "Delete failed"
      );
    }

    const updatedHistory = getHistory();
    updatedHistory.splice(index, 1);
    localStorage.setItem("starHistory", JSON.stringify(updatedHistory));

    renderHistory();
    log(`ลบสำเร็จ ID=${id} จาก ${environment.toUpperCase()}`, "ok");
  } catch (error) {
    log(`ลบไม่สำเร็จ ID=${id}: ${error.message}`, "error");
    alert(error.message);
  }
}

function resetForm() {
  ["title", "slug", "brandSearch"].forEach(id => $(id).value = "");
  $("coverImage").value = "";
  $("brandSelect").value = ""; $("categorySelect").value = "";
  $("maxRegister").value = 150; $("maxQuota").value = 120;
  $("sections").innerHTML = "";
  addSection();
  [
    "beginDate",
    "endDate",
    "startRegisterDate",
    "endRegisterDate",
    "startShippingDate",
    "startDraftDate",
    "endDraftDate",
    "startReviewDate",
    "endReviewDate"
  ].forEach(id => $(id).value = "");
  $("payloadPreview").textContent = "กด \"สร้าง Preview\" เพื่อดู variables ที่จะส่ง";
  $("campaignStatus").value = "registering";
  applyStatusTimeline();
  const bulkMode = document.querySelector('input[name="mode"][value="bulk"]');
  bulkMode.checked = true;

  document.querySelectorAll(".mode").forEach(mode => {
    mode.classList.toggle("active", mode.contains(bulkMode));
  });

  $("modeOptionsLabel").textContent = "Bulk";
  syncCountInputByMode("bulk");
  void loadOptionsAutomatically(true);
}

function syncCountInputByMode(mode) {
  const countInput = $("count");

  if (mode === "manual" || mode === "quick") {
    countInput.value = 1;
    countInput.disabled = true;
    return;
  }

  countInput.disabled = false;

  if (!countInput.value || Number(countInput.value) < 1) {
    countInput.value = 5;
  }
}

$("modeOptionsBtn").onclick = () => {
  $("modeOptionsDialog").showModal();
};

$("closeModeOptionsBtn").onclick = () => {
  $("modeOptionsDialog").close();
};

document
  .querySelectorAll('#modeOptionsDialog input[name="mode"]')
  .forEach(radio => {
    radio.addEventListener("click", async () => {
      document.querySelectorAll(".mode").forEach(mode => {
        mode.classList.remove("active");
      });
      // ทุกที่ที่มี: modeEl.classList.add("active")
      // เพิ่มให้เป็นแบบนี้:
      function setModeActive(modeEl) {
        document.querySelectorAll(".mode").forEach(m => {
          m.classList.remove("active");
        });
        modeEl.classList.add("active");
        // Bounce animation
        modeEl.style.animation = "none";
        modeEl.offsetHeight;
        modeEl.style.animation = "mode-select 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
      }


      radio.closest(".mode").classList.add("active");
      // ทุกที่ที่มี: modeEl.classList.add("active")
      // เพิ่มให้เป็นแบบนี้:
      function setModeActive(modeEl) {
        document.querySelectorAll(".mode").forEach(m => {
          m.classList.remove("active");
        });
        modeEl.classList.add("active");
        // Bounce animation
        modeEl.style.animation = "none";
        modeEl.offsetHeight;
        modeEl.style.animation = "mode-select 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
      }

      radio.checked = true;

      syncCountInputByMode(radio.value);

      $("modeOptionsLabel").textContent =
        radio.closest(".mode").querySelector("strong").textContent;

      $("modeOptionsDialog").close();
    });
  });



const quickModeInput = document.querySelector('input[name="mode"][value="quick"]');

if (quickModeInput) {
  quickModeInput.addEventListener("click", async () => {
    document.querySelectorAll(".mode").forEach(mode => {
      mode.classList.remove("active");
    });
    // ทุกที่ที่มี: modeEl.classList.add("active")
    // เพิ่มให้เป็นแบบนี้:
    function setModeActive(modeEl) {
      document.querySelectorAll(".mode").forEach(m => {
        m.classList.remove("active");
      });
      modeEl.classList.add("active");
      // Bounce animation
      modeEl.style.animation = "none";
      modeEl.offsetHeight;
      modeEl.style.animation = "mode-select 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }


    quickModeInput.closest(".mode").classList.add("active");
    // ทุกที่ที่มี: modeEl.classList.add("active")
    // เพิ่มให้เป็นแบบนี้:
    function setModeActive(modeEl) {
      document.querySelectorAll(".mode").forEach(m => {
        m.classList.remove("active");
      });
      modeEl.classList.add("active");
      // Bounce animation
      modeEl.style.animation = "none";
      modeEl.offsetHeight;
      modeEl.style.animation = "mode-select 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }

    quickModeInput.checked = true;



    const environment = selectedEnvironment();

    if (!getToken(environment)) {
      alert(`กรุณาใส่ Bearer Token สำหรับ ${environment.toUpperCase()} ก่อน`);
      return;
    }

    if (!loadedOptionsEnvironments.has(environment)) {
      const loaded = await loadAllOptions(environment);
      if (!loaded) return;
      loadedOptionsEnvironments.add(environment);
    }

    await createAll(true);
  });
}

$("searchBrandBtn").onclick = async () => { try { await searchBrands(); } catch (e) { log(e.message, "error"); } };
const campaignStatusDialog = $("campaignStatusDialog");

$("chooseCampaignStatusBtn").onclick = () => {
  const currentStatus = $("campaignStatus").value;
  const currentChoice = document.querySelector(
    `input[name="campaignStatusOption"][value="${currentStatus}"]`
  );

  if (currentChoice) {
    currentChoice.checked = true;
  }

  campaignStatusDialog.showModal();
};

$("closeCampaignStatusBtn").onclick = () => {
  const dialog = document.getElementById("campaignStatusDialog");
  // ล้าง flag ทุกครั้งที่ปิด dialog
  delete dialog.dataset.historyMode;
  delete dialog.dataset.historyIndex;
  dialog.close();
};


// แก้ event handler ของ applyCampaignStatusBtn
$("applyCampaignStatusBtn").onclick = async () => {
  const selectedStatus = document.querySelector(
    'input[name="campaignStatusOption"]:checked'
  );

  if (!selectedStatus) {
    alert("กรุณาเลือกสถานะกิจกรรม");
    return;
  }

  const dialog = document.getElementById("campaignStatusDialog");

  // ✅ โหมดปกติ (สร้างกิจกรรมใหม่) — ทำเหมือนเดิม
  if (dialog.dataset.historyMode !== "changeStatus") {
    $("campaignStatus").value = selectedStatus.value;
    $("campaignStatusLabel").textContent =
      selectedStatus.nextElementSibling.textContent.trim();
    applyStatusTimeline();
    dialog.close();
    return;
  }

  // ✅ โหมดเปลี่ยนสถานะ History
  const historyIndex = Number(dialog.dataset.historyIndex);
  const history = getHistory();
  const item = history[historyIndex];

  if (!item || !item.id) {
    alert("ไม่พบรายการใน History");
    dialog.close();
    return;
  }

  const environment = item.environment || selectedEnvironment();
  const statusValue = selectedStatus.value;

  // ถ้าเลือก "กำหนดเองา" (value = "") ให้ปิดโดยไม่ทำอะไร
  if (!statusValue) {
    alert("กรุณาเลือกสถานะที่ต้องการ (ไม่สามารถใช้ 'กำหนดเวลาเอง' ในโหมดนี้)");
    return;
  }

  dialog.close();
  delete dialog.dataset.historyMode;
  delete dialog.dataset.historyIndex;

  // คำนวณวันที่ใหม่จากสถานะที่เลือก
  let newDates;
  try {
    newDates = buildDatesByStatus(statusValue);
  } catch (e) {
    alert(`คำนวณวันที่ไม่สำเร็จ: ${e.message}`);
    return;
  }

  // สร้าง payload สำหรับ update (ส่ง id ของกิจกรรมที่มีอยู่แล้ว)
  const payload = {
    id: Number(item.id),
    brandId: item.brandId,
    title: item.title,
    seoSlugUrl: item.seoSlugUrl,
    sections: item.sections || [],
    coverImage: item.coverImage || { imgPath: "", imgAlt: "รูปภาพ" },
    isApplicationForm: item.isApplicationForm ?? true,
    isAllowLink: item.isAllowLink ?? true,
    isPublish: item.published ?? false,
    isRequiredImage: false,
    maxRegister: item.maxRegister || 0,
    maxQuota: item.maxQuota || 0,
    brands: item.brands || (item.brandId ? [{ id: item.brandId }] : []),
    questions: item.questions || [],
    acceptQuestions: item.acceptQuestions || [],
    categories: item.categories || [],
    interests: item.interests || null,
    eCatalogIds: item.eCatalogIds || null,
    suggestedItem: item.suggestedItem || { type: "coupon", entityId: null },
    genCodeSocialType: item.genCodeSocialType || null,
    // วันที่ใหม่จากสถานะที่เลือก
    ...newDates
  };

  log(`กำลังเปลี่ยนสถานะกิจกรรม ID=${item.id} เป็น "${statusValue}"...`);

  try {
    const data = await gql(GRAPHQL_CREATE, payload, environment);
    const result = data?.createOrUpdateBrandCampaign;

    if (!result?.successful) {
      const detail = (result?.errors || [])
        .map(x => `${x.path ? "[" + x.path + "] " : ""}${x.message}`)
        .join(" | ") || "Update failed";
      throw new Error(detail);
    }

    log(`เปลี่ยนสถานะสำเร็จ ID=${item.id} → "${statusValue}"`, "ok");
    const updatedHistory = getHistory();
    updatedHistory[historyIndex].campaignStatus = statusValue;
    localStorage.setItem("starHistory", JSON.stringify(updatedHistory));
    renderHistory();
    alert(`✅ เปลี่ยนสถานะสำเร็จ!\nID: ${item.id}\nชื่อ: ${item.title}\nสถานะใหม่: ${statusValue}`);
  } catch (e) {
    log(`เปลี่ยนสถานะไม่สำเร็จ ID=${item.id}: ${e.message}`, "error");
    alert(`❌ เปลี่ยนสถานะไม่สำเร็จ\nID: ${item.id}\nError: ${e.message}`);
  }
};

$("addSectionBtn").onclick = () => addSection();
$("buildPayloadBtn").onclick = buildPreview;
$("createAndPublishBtn").onclick = () => openCreatePreview(true);

if ($("createAndPublishTopBtn")) {
  $("createAndPublishTopBtn").onclick = () => openCreatePreview(true);
}
$("clearLogBtn").onclick = () => $("log").innerHTML = "";
function clearHistory() {
  const environment = selectedEnvironment();
  const history = getHistory();

  const canClear = item =>
    item.environment === environment &&
    (item.status === "failed" || item.deletedInBackOffice === true);

  const clearableCount = history.filter(canClear).length;

  if (!clearableCount) {
    alert("ไม่มีรายการที่สร้างไม่สำเร็จหรือทำเครื่องหมายว่าลบจาก Back Office แล้ว");
    return;
  }

  if (!confirm(`ล้าง History ${clearableCount} รายการของ ${environment.toUpperCase()}?`)) {
    return;
  }

  const remaining = history.filter(item => !canClear(item));
  localStorage.setItem("starHistory", JSON.stringify(remaining));
  renderHistory();
}

$("clearHistoryBtn").onclick = clearHistory;

$("clearTokenBtn").onclick = () => {
  $("token").value = "";
  localStorage.removeItem(tokenStorageKey());
  setApiStatus(false);
  inspectToken();
  log("ล้าง Token ของ environment ที่เลือกเรียบร้อยแล้ว", "ok");
};

const toggleBtn = $("toggleTokenBtn");
if (toggleBtn) {
  toggleBtn.onclick = () => {
    const t = $("token");
    if (t.type === "password") {
      t.type = "text";
      toggleBtn.textContent = "ซ่อน";
    } else {
      t.type = "password";
      toggleBtn.textContent = "แสดง";
    }
  };
}

let optionsLoadTimer;

$("token").addEventListener("input", () => {
  const cleaned = cleanToken($("token").value);
  const key = tokenStorageKey();

  if (cleaned) {
    localStorage.setItem(key, cleaned);
  } else {
    localStorage.removeItem(key);
  }

  inspectToken();

  clearTimeout(optionsLoadTimer);

  if (cleaned.split(".").length === 3) {
    optionsLoadTimer = setTimeout(() => {
      void loadOptionsAutomatically(true);
    }, 800);
  }
});

if ($("closeCreatePreviewBtn")) {
  $("closeCreatePreviewBtn").onclick = () => {
    $("createPreviewDialog").close();
  };
}

if ($("cancelCreatePreviewBtn")) {
  $("cancelCreatePreviewBtn").onclick = () => {
    $("createPreviewDialog").close();
  };
}

$("confirmCreatePreviewBtn").onclick = confirmCreateFromPreview;

function loadEnvironmentToken() {
  $("token").value = localStorage.getItem(tokenStorageKey()) || "";
  setApiStatus(false);
  inspectToken();
}

document
  .querySelectorAll('input[name="apiEnvironment"]')
  .forEach(radio => {
    radio.addEventListener("change", () => {
      loadEnvironmentToken();
      renderHistory();
      void loadOptionsAutomatically();
    });
  });

loadEnvironmentToken();

resetForm();
fillCategorySelect(typeof DEFAULT_CATEGORIES !== "undefined" ? DEFAULT_CATEGORIES : []);
renderHistory();

// --- Button Loading State ---
function setLoading(btnId, isLoading, originalText) {
  const btn = $(btnId);
  if (!btn) return;
  if (isLoading) {
    btn._origHTML = btn.innerHTML;
    btn.innerHTML = originalText || btn.innerHTML;
    btn.classList.add("loading");
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._origHTML || btn.innerHTML;
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ใช้งาน:
// setLoading("createAndPublishBtn", true, "กำลังสร้าง...");
// setLoading("createAndPublishBtn", false);

// Typewriter h1 เมื่อโหลดหน้า
window.addEventListener("load", () => {
  const h1 = document.querySelector("h1");
  if (h1) {
    const originalText = h1.textContent.trim();
    typewriterEffect(h1, originalText, 55);
  }
});

function initVerifyUserMock() {
  const clearBtn = $("verifyClearBtn");
  if (!clearBtn) return;

  clearBtn.onclick = () => {
    const phone = $("verifyPhone").value.trim();
    const result = $("verifyResult");

    const selectedItems = [
      ...document.querySelectorAll('#tab-verify input[type="checkbox"]:checked')
    ].map(input => input.closest("label").textContent.trim());

    result.hidden = false;
    result.className = "verify-result";

    if (!/^0\d{9}$/.test(phone)) {
      result.classList.add("error");
      result.textContent = "กรุณากรอกเบอร์มือถือให้ถูกต้อง เช่น 0812345678";
      return;
    }

    if (!selectedItems.length) {
      result.classList.add("error");
      result.textContent = "กรุณาเลือกข้อมูลที่ต้องการเคลียร์อย่างน้อย 1 รายการ";
      return;
    }

    result.classList.add("success");
    result.textContent = `เคลียร์ข้อมูลสำเร็จ: ${selectedItems.join(", ")}`;
  };
}

initVerifyUserMock();

const Q_MY_DISPLAY_NAME = `
query MyDisplayName {
  myProfile { displayName }
}
`;

const Q_STAR_PROFILE_OVERVIEW = `
query StarProfileOverview {
  myProfile {
    id
    displayName
    nickname
    tel
    lineId
    verifyStatus
    categories(limit: 20) { id name }
    socialProfiles {
      type
      followerCount
      photoPrice
      shortVdoPrice
      longVdoPrice
      sharingPrice
    }
    creatorProfile {
      creatorType
      profileImages { image { imgPath } seq }
      portfolio {
        images { image { imgPath } seq }
        videos { videoThumbnail { imgPath } video { videoPath } seq }
      }
      preferredProvinces
      availableTimes {
        day
        timeSlots { timeSlotKey isSelected }
      }
      tel
      lineId
      website
      bodyMeasurement {
        weight { value unit }
        height { value unit }
        chest { value unit }
        waist { value unit }
        hip { value unit }
        shoeSize { value unit }
      }
    }
  }
  myAddress { id address province district subDistrict zipcode }
  myUserVerify { status reason createdDate { short } }
  brandCampaignPayoutProfiles(mode: latest) {
    successful
    entities {
      payoutType
      bankName
      accountNumber
      accountName
    }
  }
  socialProfileInsights {
    socialType
    completed
  }
}`;

const M_RESET_STAR_PROFILE_FOR_TEST = `
mutation ResetStarProfileForTest($steps: [StarProfileTestStep!]!) {
  resetStarProfileForTest(steps: $steps) {
    successful
    errors {
      message
    }
  }
}`;

const M_CHANGE_USER_VERIFY_STATE_FOR_TEST = `
mutation ChangeUserVerifyStateForTest($state: UserVerifyTestState!) {
  changeUserVerifyStateForTest(state: $state) {
    successful
    errors {
      message
    }
    entity {
      status
    }
  }
}`;

// ==========================================
// 📦 GraphQL Mutations สำหรับ Mock Data
// ==========================================
const M_CREATE_OR_UPDATE_CREATOR = `
mutation CreateOrUpdateCreatorProfile(
  $bodyMeasurement: InputCreatorBodyMeasurement
  $tel: String
  $showTel: Boolean
  $lineId: String
  $showLineId: Boolean
  $website: String
  $showWebsite: Boolean
  $availableTimes: [InputCreatorAvailableTimes!]
  $preferredProvinces: [String!]
  $profileImages: [InputCreatorImage!]
  $portfolio: InputCreatorPortfolio
  $creatorType: CreatorType
) {
  createOrUpdateCreatorProfile(
    bodyMeasurement: $bodyMeasurement
    tel: $tel
    showTel: $showTel
    lineId: $lineId
    showLineId: $showLineId
    website: $website
    showWebsite: $showWebsite
    availableTimes: $availableTimes
    preferredProvinces: $preferredProvinces
    profileImages: $profileImages
    portfolio: $portfolio
    creatorType: $creatorType
  ) {
    successful
    errors { path message }
  }
}`;

const M_ANALYZE_SOCIAL_PROFILE_INSIGHT = `
mutation AnalyzeSocialProfileInsight(
  $socialType: SocialProfileType!
  $insightType: SocialInsightType!
  $imageUrl: String!
) {
  analyzeSocialProfileInsight(
    socialType: $socialType
    insightType: $insightType
    imageUrl: $imageUrl
  ) {
    successful
    errors {
      path
      message
    }
    insight {
      socialType
      completed
    }
  }
}`;


const M_CREATE_SOCIAL_PROFILE = `
mutation CreateSocialProfile(
  $socialType: SocialProfileType!
  $profileUrl: String!
  $followerCount: Int
  $photoPrice: Int
  $shortVdoPrice: Int
  $longVdoPrice: Int
  $sharingPrice: Int
) {
  createSocialProfile(
    socialType: $socialType
    profileUrl: $profileUrl
    followerCount: $followerCount
    photoPrice: $photoPrice
    shortVdoPrice: $shortVdoPrice
    longVdoPrice: $longVdoPrice
    sharingPrice: $sharingPrice
  ) {
    successful
    errors { path message }
  }
}`;

const M_SET_USER_CATEGORIES = `
mutation SetUserCategories($categories: [InputEntity!]!) {
  setUserCategories(categories: $categories) {
    successful
    errors { path message }
  }
}`;

const M_EDIT_PROFILE_CAPTION = `
mutation EditProfileCaption($caption: String) {
  editProfile(caption: $caption) {
    successful
    errors { path message }
  }
}`;

const M_EDIT_PROFILE_NICKNAME = `
mutation EditProfileNickname($nickname: String) {
  editProfile(nickname: $nickname) {
    successful
    errors { path message }
  }
}`;

const M_UPSERT_PAYOUT = `
mutation UpsertMyPayoutProfile(
  $profileId: String
  $payoutType: UnboxPayoutRecipientType!
  $individual: UnboxPayoutIndividualInput
  $juristic: UnboxPayoutJuristicInput
  $bankBookCopyImage: InputImage
  $bankCode: String!
  $bankName: String!
  $accountNumber: String!
  $accountName: String!
  $useSameAsDocument: Boolean
  $taxAddress: UnboxPayoutTaxAddressInput!
  $phone: String!
  $email: String!
) {
  upsertMyPayoutProfile(
    profileId: $profileId
    payoutType: $payoutType
    individual: $individual
    juristic: $juristic
    bankBookCopyImage: $bankBookCopyImage
    bankCode: $bankCode
    bankName: $bankName
    accountNumber: $accountNumber
    accountName: $accountName
    useSameAsDocument: $useSameAsDocument
    taxAddress: $taxAddress
    phone: $phone
    email: $email
  ) {
    successful
    errors { path message }
  }
}`;

const M_CREATE_USER_ADDRESS = `
mutation CreateUserAddress(
  $name: String!
  $tel: String!
  $address: String!
  $province: String!
  $district: String!
  $subDistrict: String!
  $zipcode: String!
) {
  createUserAddress(
    name: $name
    tel: $tel
    address: $address
    province: $province
    district: $district
    subDistrict: $subDistrict
    zipcode: $zipcode
  ) {
    successful
    errors { path message }
  }
}`;

// ==========================================
// 🛠️ ตาราง Mock Data และคำสั่งแยกตามแต่ละ Key
// ==========================================
const MOCK_DATA_HANDLERS = {
  // 1. ประเภทครีเอเตอร์
  kind: {
    title: "ประเภทครีเอเตอร์",
    run: async () => {
      // 🎲 สุ่มเลือกระหว่าง "creator" หรือ "page"
      const creatorTypes = ["creator", "page"];
      const randomCreatorType = creatorTypes[Math.floor(Math.random() * creatorTypes.length)];

      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        creatorType: randomCreatorType
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },


  // 2. ช่องทางของฉัน + เรท
  socials: {
  title: "ช่องทางของฉัน + เรท",
  run: async () => {
    const socials = [
      {
        socialType: "facebook",
        urlPrefix: "https://www.facebook.com/facebook_",
        hasPhotoPrice: true
      },
      {
        socialType: "instagram",
        urlPrefix: "https://www.instagram.com/instagram_",
        hasPhotoPrice: true
      },
      {
        socialType: "tiktok",
        urlPrefix: "https://www.tiktok.com/@tiktok_",
        hasPhotoPrice: false
      }
    ];

    // สุ่มเลือก social 1 รายการ
    const social = socials[Math.floor(Math.random() * socials.length)];
    const timestamp = Date.now();

    // สุ่มเลขจำนวนเต็มระหว่าง min ถึง max
    const randomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const variables = {
      socialType: social.socialType,
      profileUrl: `${social.urlPrefix}${timestamp}`,
      followerCount: randomInt(1_000, 1_000_000),
      shortVdoPrice: randomInt(50, 5_000)
    };

    // ส่ง photoPrice เฉพาะ social ที่รองรับ
    if (social.hasPhotoPrice) {
      variables.photoPrice = randomInt(25, 3_000);
    }

    const res = await frontGql(M_CREATE_SOCIAL_PROFILE, variables);
    checkGraphQLErrors(res.createSocialProfile);
  }
},


    // 3. สายที่ใช่
  categories: {
    title: "สายที่ใช่",
    run: async () => {
      // สุ่มจำนวน 3-5 สาย แล้วหยิบแบบไม่ซ้ำ
      const count = randomInt(3, 5);
      const picked = shuffle(ALL_CATEGORIES).slice(0, count);

      console.log("สุ่มสายที่ใช่ได้:", picked.map(c => c.name).join(", "));

      const res = await frontGql(M_SET_USER_CATEGORIES, {
        categories: picked.map(c => ({ id: c.id })) // ส่งไปแค่ id
      });
      checkGraphQLErrors(res.setUserCategories);
    }
  },

    // 4. เกี่ยวกับคุณ
  about: {
    title: "เกี่ยวกับคุณ",
    run: async () => {
      // 1) อ่านข้อย่อยที่ติ๊ก (เฉพาะที่ ready)
      let subs = [
        ...document.querySelectorAll('#tab-verify .verify-sub-check[data-parent="about"]:checked')
      ].map(cb => cb.value);

      // ไม่ได้ติ๊กข้อย่อยเลย → ทำทุกข้อที่มี API แล้ว
      if (!subs.length) {
        subs = ABOUT_SUB_ITEMS.filter(s => s.ready).map(s => s.key);
      }

      // 2) แนะนำตัว: ดึงชื่อจาก myProfile ก่อน แล้วส่ง caption
      if (subs.includes("caption")) {
        const me = await frontGql(Q_MY_DISPLAY_NAME);
        const displayName = me.myProfile?.displayName || "";
        const capRes = await frontGql(M_EDIT_PROFILE_CAPTION, {
          caption: `สวัสดีเราชื่อ ${displayName}`
        });
        checkGraphQLErrors(capRes.editProfile);
      }

      // 3) รูป / ผลงาน: รวมเป็น request เดียว ส่งเฉพาะส่วนที่เลือก
      const variables = {};
      const portfolio = {};

      if (subs.includes("profileImages"))   variables.profileImages = randomImageItems();
      if (subs.includes("portfolioImages")) portfolio.images = randomImageItems();
      if (subs.includes("portfolioVideos")) portfolio.videos = randomVideoItems();

      if (Object.keys(portfolio).length) variables.portfolio = portfolio;

      console.log("เกี่ยวกับคุณ → ข้อย่อย:", subs, "ข้อมูลที่ส่ง:", variables);

      // ส่งเฉพาะเมื่อมีอะไรให้ส่งจริง
      if (Object.keys(variables).length) {
        const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, variables);
        checkGraphQLErrors(res.createOrUpdateCreatorProfile);
      }

            // 4) ชื่อเล่น: สุ่มจากคลังผลไม้/สัตว์
      if (subs.includes("nickname")) {
        const nickname = randomChoice(MOCK_NICKNAME_POOL);
        console.log("สุ่มชื่อเล่นได้:", nickname);

        const nickRes = await frontGql(M_EDIT_PROFILE_NICKNAME, { nickname });
        checkGraphQLErrors(nickRes.editProfile);
      }

      // TODO: creatorAvatar → เพิ่มตรงนี้เมื่อได้ API
    }
  },


   // 5. พื้นที่รับงาน
  provinces: {
    title: "พื้นที่รับงาน",
    run: async () => {
      // สุ่ม 1-3 จังหวัด (ระบบให้เลือกได้ไม่เกิน 3) แบบไม่ซ้ำ
      const count = randomInt(1, 3);
      const picked = shuffle(ALL_PROVINCES).slice(0, count);

      console.log("สุ่มพื้นที่รับงานได้:", picked.join(", "));

      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        preferredProvinces: picked
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

    // 6. วันเวลาว่างรับงาน
  availability: {
    title: "วันเวลาว่างรับงาน",
    run: async () => {
      // สุ่ม 1-7 วัน แต่ละวันสุ่ม 1-4 ช่วงเวลา (ไม่ซ้ำ เรียงตามลำดับ)
      const days = randomSubsetInOrder(ALL_DAYS, 1, 7);
      const availableTimes = days.map(day => ({
        day,
        timeSlots: randomSubsetInOrder(ALL_TIME_SLOTS, 1, 4),
      }));

      console.table(
        availableTimes.map(d => ({ day: d.day, slots: d.timeSlots.join(", ") }))
      );

      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, { availableTimes });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 7. ช่องทางติดต่อ
  contact: {
    title: "ช่องทางติดต่อ",
    run: async () => {
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        lineId: "@koasoon90",
        showLineId: true,
        tel: "0811111190",
        showTel: true,
        website: "https://theedanai.devsh@gmail.com",
        showWebsite: true
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 8. ข้อมูลผู้ติดตาม (Insight)
  insight: {
    title: "ข้อมูลผู้ติดตาม",
    run: async () => {
      // 💡 ส่งภาพ Insight ทั้ง 3 ด้าน (เพศ, อายุ, พื้นที่) เข้าสู่ระบบ
      const insightImages = [
        { type: "gender", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilegenderagepng-7yqq50aggmy2.jpg" },
        { type: "age", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilegenderagepng-6xh8vsa9cbvm.jpg" },
        { type: "location", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilecity-t89wn9abqwj3.jpg" }
      ];

      for (const item of insightImages) {
        const res = await frontGql(M_ANALYZE_SOCIAL_PROFILE_INSIGHT, {
          socialType: "facebook",
          insightType: item.type,
          imageUrl: item.url
        });
        checkGraphQLErrors(res.analyzeSocialProfileInsight);
      }
    }
  },


  // 9. บัญชีรับเงิน
  payout: {
    title: "บัญชีรับเงิน",
    run: async () => {
      const res = await frontGql(M_UPSERT_PAYOUT, {
        payoutType: "juristic",
        individual: null,
        juristic: {
          juristicCertificateImage: null,
          juristicName: "บริษัท เซลเฮียร์ กรุ๊ป จำกัด",
          juristicId: "0105564133098",
          juristicAddress: "1240/16 ซอยสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร",
          officeType: "headquarters"
        },
        bankBookCopyImage: null,
        bankCode: "011",
        bankName: "ธนาคารทหารไทยธนชาต",
        accountNumber: "7609418285",
        accountName: "นาง ตัวอย่าง สมมติ",
        useSameAsDocument: false,
        taxAddress: {
          taxpayerName: "บริษัท 1111 จำกัด",
          taxpayerId: "0105564133098",
          address: "1240/16 ซอยสุขุมวิท",
          zipcode: "10250",
          subDistrict: "ประเวศ",
          district: "เขตประเวศ",
          province: "กรุงเทพมหานคร"
        },
        phone: "0811111168",
        email: "theedanai.devsh@gmai.com"
      });
      checkGraphQLErrors(res.upsertMyPayoutProfile);
    }
  },

  // 10. ที่อยู่รับของ
  address: {
    title: "ที่อยู่รับของ",
    run: async () => {
      const res = await frontGql(M_CREATE_USER_ADDRESS, {
        name: "เก้าศูนย์ ซิท",
        tel: "0811111190",
        address: "90",
        zipcode: "10900",
        subDistrict: "จตุจักร",
        district: "เขตจตุจักร",
        province: "กรุงเทพมหานคร"
      });
      checkGraphQLErrors(res.createUserAddress);
    }
  },

  // 11. สัดส่วน
  body: {
    title: "สัดส่วน",
    run: async () => {
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        bodyMeasurement: {
          weight: { value: 59, unit: "kg" },
          height: { value: 169, unit: "cm" },
          chest: { value: 36, unit: "inch" },
          waist: { value: 29, unit: "inch" },
          hip: { value: 36, unit: "inch" },
          shoeSize: { value: 40, unit: "eur" }
        }
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  }
};

// ฟังก์ชันช่วยเช็ค error ใน payload
function checkGraphQLErrors(responseObj) {
  if (responseObj && responseObj.successful === false) {
    const msg = (responseObj.errors || []).map(e => e.message).join(", ") || "ไม่สำเร็จ";
    throw new Error(msg);
  }
}


async function frontGql(query, variables = {}) {
  const token = cleanToken($("verifyFrontToken").value);

  if (!token) {
    throw new Error("กรุณาวาง token จากเว็บหน้าบ้านก่อน");
  }

  const res = await fetch(`/api/front-graphql?environment=${selectedEnvironment()}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": token
    },
    body: JSON.stringify({ query, variables })
  });

  const text = await res.text();
  let json;

  try {
    json = JSON.parse(text);
  } catch (err) {
    // ถ้า Server ตอบกลับเป็น HTML ให้ดึงหัวข้อ error หรือ status มาแสดงแทน
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

function renderVerifyRows(containerId, rows) {
  $(containerId).innerHTML = rows.map(row => {
    const hasData = row.values && row.values.length > 0;
    const statusClass = hasData ? "has-data" : "is-empty";

    // ส่วนคอนโทรลขวาสุด: ถ้าเป็น kyc ให้แสดง Dropdown ถ้าเป็นข้ออื่นแสดง Checkbox ปกติ
    const actionControl = row.isSelect
      ? `
        <select class="verify-kyc-select" data-key="${row.key}">
          <option value="none" ${row.currentStatus === 'none' ? 'selected' : ''}>none (ยังไม่เคยส่ง)</option>
          <option value="waiting_approve" ${row.currentStatus === 'waiting_approve' ? 'selected' : ''}>waiting_approve (รอตรวจ)</option>
          <option value="approved" ${row.currentStatus === 'approved' ? 'selected' : ''}>approved (อนุมัติแล้ว)</option>
          <option value="reject" ${row.currentStatus === 'reject' ? 'selected' : ''}>reject (ไม่ผ่าน)</option>
        </select>
      `
      : `
        <input
          class="verify-row-check"
          type="checkbox"
          value="${row.key}"
        />
      `;

          // checkbox ย่อย (มีเฉพาะแถวที่ส่ง subItems มา)
    const subControls = row.subItems
      ? `
        <div class="verify-sub-list">
          ${row.subItems.map(sub => `
            <label class="verify-sub-item ${sub.ready ? "" : "is-pending"}">
              <input
                class="verify-sub-check"
                type="checkbox"
                data-parent="${row.key}"
                value="${sub.key}"
                ${sub.ready ? "" : "disabled"}
              />
              ${sub.label}${sub.ready ? "" : " (รอ API)"}
            </label>
          `).join("")}
        </div>
      `
      : "";

    return `
      <div class="verify-row ${statusClass}">
        <div class="verify-row-icon">${row.icon}</div>

        <div>
          <div class="verify-row-title">${row.title}</div>
          <div class="verify-tags">
            ${hasData
        ? row.values.map(value => `<span class="verify-tag">${escapeHtml(value)}</span>`).join("")
        : `<span class="verify-empty">ไม่มีข้อมูล</span>`
      }
          </div>
          ${subControls}
        </div>

        ${actionControl}
      </div>
    `;
  }).join("");

  // ผูก Event ให้กับ Dropdown KYC
  attachKycSelectEvents(containerId);
    // ติ๊กข้อย่อยตัวไหนก็ตาม → ติ๊กแถวหลักให้อัตโนมัติ
  $(containerId).querySelectorAll(".verify-sub-check").forEach(sub => {
    sub.addEventListener("change", () => {
      if (!sub.checked) return;
      const parent = $(containerId).querySelector(
        `.verify-row-check[value="${sub.dataset.parent}"]`
      );
      if (parent) parent.checked = true;
    });
  });
}

function attachKycSelectEvents(containerId) {
  const container = $(containerId);
  if (!container) return;

  const selects = container.querySelectorAll(".verify-kyc-select");
  selects.forEach(select => {
    select.onchange = async (e) => {
      const newState = e.target.value;
      const result = $("verifyResult");
      result.hidden = false;
      result.className = "verify-result";
      result.textContent = `กำลังเปลี่ยนสถานะยืนยันตัวตนเป็น "${newState}"...`;
      select.disabled = true;

      try {
        const data = await frontGql(M_CHANGE_USER_VERIFY_STATE_FOR_TEST, {
          state: newState
        });

        const resp = data.changeUserVerifyStateForTest;
        if (!resp?.successful) {
          const msg = (resp?.errors || []).map(err => err.message).join(" | ") || "เปลี่ยนสถานะไม่สำเร็จ";
          throw new Error(msg);
        }

        result.className = "verify-result success";
        result.textContent = `เปลี่ยนสถานะเป็น ${newState} สำเร็จ! กำลังอัปเดตข้อมูล...`;

        // โหลดข้อมูลภาพรวมใหม่ สีและการนับข้อจะอัปเดตอัตโนมัติ
        await loadVerifyProfileOverview();

        result.textContent = `เปลี่ยนสถานะยืนยันตัวตนเป็น "${newState}" เรียบร้อยแล้ว`;
      } catch (err) {
        result.className = "verify-result error";
        result.textContent = err.message;
      } finally {
        select.disabled = false;
      }
    };
  });
}



function formatFollower(count) {
  if (!count) return null;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

function compact(values) {
  return values.filter(value => value !== null && value !== undefined && value !== "");
}

function buildVerifyRows(data) {
  const profile = data.myProfile || {};
  const creator = profile.creatorProfile || {};
  const payout = data.brandCampaignPayoutProfiles?.entities?.[0];
  const address = data.myAddress;
  const measurement = creator.bodyMeasurement || {};

  const socials = (profile.socialProfiles || []).map(social => {
    const follower = formatFollower(social.followerCount);
    return follower ? `${social.type.toUpperCase()} ${follower}` : social.type.toUpperCase();
  });

  const prices = (profile.socialProfiles || []).flatMap(social => compact([
    social.photoPrice ? `${social.type} รูป ${social.photoPrice}` : null,
    social.shortVdoPrice ? `${social.type} วิดีโอสั้น ${social.shortVdoPrice}` : null,
    social.longVdoPrice ? `${social.type} วิดีโอยาว ${social.longVdoPrice}` : null,
    social.sharingPrice ? `${social.type} แชร์ ${social.sharingPrice}` : null
  ]));

  const portfolioCount =
    (creator.profileImages || []).length +
    (creator.portfolio?.images || []).length +
    (creator.portfolio?.videos || []).length;

  const availableDays = (creator.availableTimes || [])
    .filter(day => day.timeSlots?.some(slot => slot.isSelected))
    .map(day => day.day);

  const bodyValues = compact([
    measurement.height?.value ? `${measurement.height.value} ${measurement.height.unit}` : null,
    measurement.weight?.value ? `${measurement.weight.value} ${measurement.weight.unit}` : null,
    measurement.chest?.value && measurement.waist?.value && measurement.hip?.value
      ? `${measurement.chest.value}-${measurement.waist.value}-${measurement.hip.value}`
      : null
  ]);

  const kycStatus = data.myUserVerify?.status || profile.verifyStatus || "none";
  // ถ้าเป็น none ให้ถือว่ายังไม่ยืนยัน (ไม่มีข้อมูล)
  const kycValues = kycStatus && kycStatus !== "none" ? [kycStatus] : [];

  const mainRows = [
    { key: "kind", icon: "T", title: "ประเภทครีเอเตอร์", values: compact([creator.creatorType]) },
    { key: "socials", icon: "R", title: "ช่องทางของฉัน + เรท", values: [...socials, ...prices] },
    { key: "categories", icon: "C", title: "สายที่ใช่", values: (profile.categories || []).map(item => item.name) },
        {
      key: "about", icon: "P", title: "เกี่ยวกับคุณ",
      values: compact([
        portfolioCount ? `รูป/ผลงาน ${portfolioCount}` : null,
        profile.nickname ? `ชื่อเล่น: ${profile.nickname}` : null,
      ]),
      subItems: ABOUT_SUB_ITEMS
    },
    { key: "provinces", icon: "A", title: "พื้นที่รับงาน", values: creator.preferredProvinces || [] },
    { key: "availability", icon: "D", title: "วันเวลาว่างรับงาน", values: availableDays },
    { key: "contact", icon: "L", title: "ช่องทางติดต่อ", values: compact([creator.lineId, creator.tel, creator.website]) },
    // 👇 ปรับแถว kyc ให้ส่ง currentStatus และ type เป็น select
    {
      key: "kyc",
      icon: "K",
      title: "ยืนยันตัวตน",
      values: kycValues,
      isSelect: true,
      currentStatus: kycStatus
    }
  ];

  // ==========================================
  // 🚀 Event ปุ่ม "เพิ่มข้อมูล" (Mock Data)
  // ==========================================
  const addMockBtn = $("verifyAddMockBtn");
  if (addMockBtn) {
    addMockBtn.onclick = async () => {
      // ดึงเฉพาะ checkbox ที่ติ๊ก (ยกเว้น rank เพราะ rank คือถอดยศ)
      const selected = [
        ...document.querySelectorAll('#tab-verify .verify-row-check:checked')
      ].map(input => input.value).filter(val => val !== "rank");

      const result = $("verifyResult");
      result.hidden = false;
      result.className = "verify-result";

      if (!selected.length) {
        result.classList.add("error");
        result.textContent = "กรุณาติ๊กเลือกข้อที่ต้องการเพิ่มข้อมูลอย่างน้อย 1 ข้อ";
        return;
      }

      if (!confirm(`ต้องการเพิ่มข้อมูล (Mock Data) จำนวน ${selected.length} รายการใช่ไหม?`)) {
        return;
      }

      addMockBtn.disabled = true;
      result.textContent = "กำลังดำเนินการเพิ่มข้อมูล Mock Data...";

      const successList = [];
      const skippedList = [];

      // 🔄 วนลูปทำงานทีละข้อ: ข้อไหนติด Logic ให้ข้าม แล้วทำข้อถัดไป
      for (const key of selected) {
        const handler = MOCK_DATA_HANDLERS[key];
        if (!handler) continue;

        try {
          await handler.run();
          successList.push(handler.title);
        } catch (err) {
          // ⚠️ บันทึกข้อที่ติดปัญหา/ข้าม พร้อมเหตุผล
          skippedList.push(`${handler.title} (${err.message})`);
        }
      }

      // ปลดติ๊ก checkbox
      document.querySelectorAll('#tab-verify .verify-row-check:checked').forEach(cb => {
        if (cb.value !== "rank") cb.checked = false;
      });

      // โหลดข้อมูลล่าสุดมาแสดงผล สีและการนับข้อจะอัปเดตทันที
      await loadVerifyProfileOverview();

      // สรุปผลลัพธ์
      if (skippedList.length === 0) {
        result.className = "verify-result success";
        result.textContent = `✅ เพิ่มข้อมูลสำเร็จทั้งหมด ${successList.length} รายการ: ${successList.join(", ")}`;
      } else if (successList.length > 0) {
        result.className = "verify-result success";
        result.textContent = `✅ เพิ่มสำเร็จ ${successList.length} ข้อ: ${successList.join(", ")} | ⚠️ ข้าม ${skippedList.length} ข้อ: ${skippedList.join(" | ")}`;
      } else {
        result.className = "verify-result error";
        result.textContent = `❌ ไม่สามารถเพิ่มข้อมูลได้: ${skippedList.join(" | ")}`;
      }

      addMockBtn.disabled = false;
    };
  }


  const readyRows = [
    {
      key: "insight",
      icon: "I",
      title: "ข้อมูลผู้ติดตาม",
      values: (data.socialProfileInsights || [])
        .filter(item => item.completed)
        .map(item => `${item.socialType} สำเร็จ`)
    },
    {
      key: "payout",
      icon: "B",
      title: "บัญชีรับเงิน",
      values: compact([payout?.payoutType, payout?.bankName, payout?.accountNumber ? `••${String(payout.accountNumber).slice(-4)}` : null])
    },
    {
      key: "address",
      icon: "H",
      title: "ที่อยู่รับของ",
      values: address ? compact([address.subDistrict, address.district, address.province, address.zipcode]) : []
    },
    {
      key: "body",
      icon: "S",
      title: "สัดส่วน",
      values: bodyValues
    }
  ];


  return { mainRows, readyRows, profile };
}

// ===== ประวัติ token หน้าบ้าน (แยกตามเบอร์) =====
const VERIFY_TOKEN_HISTORY_KEY = "starVerifyTokenHistory";

// ถอดท่อนกลางของ JWT → object  (ถอดไม่ได้คืน null)
function decodeJwtPayload(token) {
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
function isTokenExpired(exp) {
  return !exp || exp * 1000 <= Date.now();
}

function getVerifyTokenHistory() {
  try {
    return JSON.parse(localStorage.getItem(VERIFY_TOKEN_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function setVerifyTokenHistory(list) {
  localStorage.setItem(VERIFY_TOKEN_HISTORY_KEY, JSON.stringify(list));
}

// บันทึก/อัปเดตรายการของเบอร์นี้ (เบอร์ซ้ำ → แทนที่ของเดิม)
function saveVerifyTokenHistory(token, profile) {
  const tel = profile?.tel;
  if (!tel) return; // ไม่มีเบอร์ → ไม่รู้จะใช้อะไรเป็นชื่อในรายการ

  const payload = decodeJwtPayload(token) || {};
  const entry = {
    tel,
    displayName: profile.displayName || "",
    token,
    exp: payload.exp || null,
    env: payload.user?.env || "",
    savedAt: Date.now(),
  };

  const others = getVerifyTokenHistory().filter(item => item.tel !== tel);
  setVerifyTokenHistory([entry, ...others]); // ล่าสุดอยู่บนสุด
}

// วาด dropdown + ลบตัวที่หมดอายุทิ้ง
function renderVerifyTokenHistory(selectedTel = "") {
  const select = $("verifyTokenHistory");
  if (!select) return;

  const alive = getVerifyTokenHistory().filter(item => !isTokenExpired(item.exp));
  setVerifyTokenHistory(alive); // เขียนกลับ → ตัวหมดอายุหายจาก storage จริง

  select.innerHTML =
    `<option value="">— เลือกเบอร์ (${alive.length}) —</option>` +
    alive.map(item => {
      const expText = new Date(item.exp * 1000).toLocaleDateString("th-TH");
      const env = item.env ? `[${item.env.toUpperCase()}] ` : "";
      const name = item.displayName ? ` · ${escapeHtml(item.displayName)}` : "";
      return `<option value="${escapeHtml(item.tel)}" ${item.tel === selectedTel ? "selected" : ""}>
        ${env}${escapeHtml(item.tel)}${name} (หมดอายุ ${expText})
      </option>`;
    }).join("");
}

async function loadVerifyProfileOverview() {
  const data = await frontGql(Q_STAR_PROFILE_OVERVIEW);
  const { mainRows, readyRows, profile } = buildVerifyRows(data);

  renderVerifyRows("verifyMainList", mainRows);
  renderVerifyRows("verifyReadyList", readyRows);

  const mainCompleted = mainRows.filter(row => row.values.length).length;
  const readyCompleted = readyRows.filter(row => row.values.length).length;

  $("verifyMainCount").textContent = `ครบ ${mainCompleted}/${mainRows.length} ข้อ`;
  $("verifyMainCount").style.color =
    mainCompleted === mainRows.length ? "var(--green, #059669)" : "var(--muted)";
  $("verifyMainCount").style.fontWeight =
    mainCompleted === mainRows.length ? "700" : "normal";

  $("verifyReadyCount").textContent = `ครบ ${readyCompleted}/${readyRows.length} ข้อ`;
  $("verifyReadyCount").style.color =
    readyCompleted === readyRows.length ? "var(--green, #059669)" : "var(--muted)";
  $("verifyReadyCount").style.fontWeight =
    readyCompleted === readyRows.length ? "700" : "normal";

  $("verifyProfileSummary").hidden = false;
  $("verifyProfileSummary").textContent =
        `ผู้ใช้: ${profile.displayName || "ไม่มีข้อมูล"} | ชื่อเล่น: ${profile.nickname || "-"} | เบอร์: ${profile.tel || "ไม่มีข้อมูล"}`;
        return profile;

}

function initVerifyUserProfile() {
  const loadBtn = $("loadVerifyProfileBtn");
  const clearBtn = $("verifyClearSelectedBtn");
  const clearTokenBtn = $("clearVerifyTokenBtn");
  const tokenInput = $("verifyFrontToken");

  if (!loadBtn || !clearBtn) return;

  // 1. ดึง Token ล่าสุดจาก localStorage มาใส่ในกล่องข้อความอัตโนมัติ
  if (tokenInput) {
    tokenInput.value = localStorage.getItem("starVerifyFrontToken") || "";

    // บันทึก Token ทุกครั้งที่มีการพิมพ์หรือวาง
    tokenInput.oninput = () => {
      const val = tokenInput.value.trim();
      if (val) {
        localStorage.setItem("starVerifyFrontToken", val);
      } else {
        localStorage.removeItem("starVerifyFrontToken");
      }
    };
        // ขยายตามเนื้อหาเมื่อโฟกัส / ย่อกลับเมื่อออกจากช่อง
    const autoGrow = () => {
      tokenInput.style.height = "auto";                        // รีเซ็ตก่อน ไม่งั้นวัดได้แค่ความสูงเดิม
      tokenInput.style.height = `${tokenInput.scrollHeight}px`; // ตั้งตามความสูงจริงของข้อความ
    };

    tokenInput.addEventListener("focus", autoGrow);
    tokenInput.addEventListener("input", () => {
      if (document.activeElement === tokenInput) autoGrow();
    });
    tokenInput.addEventListener("blur", () => {
      tokenInput.style.height = "";   // ลบค่าจาก JS → กลับไปใช้ 40px ตาม CSS
      tokenInput.scrollTop = 0;       // เลื่อนกลับไปต้นข้อความ
    });
  }

  // 2. Event ปุ่ม "เคลียร์ Token"
  if (clearTokenBtn && tokenInput) {
    clearTokenBtn.onclick = () => {
            if ($("verifyTokenHistory")) $("verifyTokenHistory").value = "";
      tokenInput.value = "";
      localStorage.removeItem("starVerifyFrontToken");
      tokenInput.focus();
    };
  }

  // 3. เมื่อกดปุ่ม "โหลดข้อมูลผู้ใช้" ก็ให้บันทึก Token ล่าสุดไว้ด้วยเช่นกัน
  loadBtn.onclick = async () => {
    const token = cleanToken($("verifyFrontToken").value);
    if (token) {
      localStorage.setItem("starVerifyFrontToken", token);
    }

    const result = $("verifyResult");
    result.hidden = false;
    result.className = "verify-result";
    result.textContent = "กำลังโหลดข้อมูล...";

        try {
      const profile = await loadVerifyProfileOverview();
      saveVerifyTokenHistory(token, profile); // โหลดสำเร็จ → บันทึกประวัติ
      renderVerifyTokenHistory(profile?.tel);  // วาด dropdown ใหม่ และเลือกเบอร์นี้ไว้

      result.classList.add("success");
      result.textContent = "โหลดข้อมูลสำเร็จ";
    } catch (e) {
      result.classList.add("error");
      result.textContent = e.message;
    }
  };

    // 4. Dropdown ประวัติเบอร์
  const historySelect = $("verifyTokenHistory");
  if (historySelect && tokenInput) {
    renderVerifyTokenHistory(); // วาดครั้งแรกตอนเปิดหน้า

    historySelect.onchange = () => {
      const tel = historySelect.value;
      if (!tel) return;

      const item = getVerifyTokenHistory().find(h => h.tel === tel);

      // เผื่อหมดอายุระหว่างที่เปิดหน้าค้างไว้
      if (!item || isTokenExpired(item.exp)) {
        renderVerifyTokenHistory();
        showToast?.("Token ของเบอร์นี้หมดอายุแล้ว", "error");
        return;
      }

      tokenInput.value = item.token;
      localStorage.setItem("starVerifyFrontToken", item.token);
      loadBtn.click(); // ใช้ flow โหลดเดิมทั้งหมด
    };
  }
  // ==========================================
  // ☑️ Event ปุ่ม "เลือกทั้งหมด / ปลดเลือกทั้งหมด"
  // ==========================================
  const selectAllBtn = $("verifySelectAllBtn");
  if (selectAllBtn) {
    selectAllBtn.onclick = () => {
      // ดึง checkbox ทุกข้อในลิสต์ (ไม่รวมข้อ "ถอดยศ STAR" เพื่อความปลอดภัย)
      const listCheckboxes = [
        ...document.querySelectorAll('.verify-list .verify-row-check')
      ];

      if (!listCheckboxes.length) return;

      // ตรวจสอบว่าตอนนี้ติ๊กครบทุกอันอยู่แล้วหรือไม่
      const isAllChecked = listCheckboxes.every(cb => cb.checked);

      // ถ้าติ๊กครบแล้วให้ปลดติ๊กทั้งหมด แต่ถ้ายังไม่ครบให้ติ๊กให้หมด
      listCheckboxes.forEach(cb => {
        cb.checked = !isAllChecked;
      });

      // สลับข้อความและไอคอนบนปุ่ม
      selectAllBtn.textContent = isAllChecked ? "☑️ เลือกทั้งหมด" : "⬜ ปลดเลือกทั้งหมด";
    };
  }


  // ... (ส่วน clearBtn.onclick สำหรับเคลียร์ checkbox คงเดิม) ...


  clearBtn.onclick = async () => {
    const selected = [
      ...document.querySelectorAll('#tab-verify .verify-row-check:checked')
    ].map(input => input.value);

    const result = $("verifyResult");
    result.hidden = false;
    result.className = "verify-result";

    if (!selected.length) {
      result.classList.add("error");
      result.textContent = "กรุณาเลือกข้อมูลที่ต้องการเคลียร์";
      return;
    }

    if (!confirm(`ต้องการเคลียร์ข้อมูล ${selected.length} รายการใช่ไหม?`)) {
      return;
    }

    clearBtn.disabled = true;
    result.textContent = "กำลังเคลียร์ข้อมูล...";

    try {
      const data = await frontGql(M_RESET_STAR_PROFILE_FOR_TEST, {
        steps: selected
      });


      const resetResult = data.resetStarProfileForTest;

      if (!resetResult?.successful) {
        const message = (resetResult?.errors || [])
          .map(error => error.message)
          .join(" | ") || "เคลียร์ข้อมูลไม่สำเร็จ";

        throw new Error(message);
      }

            // backend ไม่ล้างชื่อเล่นให้ในขั้น about → ล้างเองด้วย editProfile
      if (selected.includes("about")) {
        const nickRes = await frontGql(M_EDIT_PROFILE_NICKNAME, { nickname: "" });
        checkGraphQLErrors(nickRes.editProfile);
      }

      document
        .querySelectorAll('#tab-verify .verify-row-check:checked')
        .forEach(input => {
          input.checked = false;
        });

      result.classList.add("success");
      result.textContent = "เคลียร์ข้อมูลสำเร็จ กำลังโหลดข้อมูลล่าสุด...";

      // ถ้ามีการถอดยศ rank ผู้ใช้อาจไม่สามารถโหลดโปรไฟล์ STAR ได้อีก
      const isRankDemoted = selected.includes("rank");
      try {
        await loadVerifyProfileOverview();
        result.className = "verify-result success";
        result.textContent = isRankDemoted
          ? "เคลียร์ข้อมูลและถอดยศ STAR เรียบร้อยแล้ว (สถานะ STAR ถูกยกเลิก)"
          : "เคลียร์ข้อมูลสำเร็จ และโหลดข้อมูลล่าสุดแล้ว";
      } catch (loadErr) {
        if (isRankDemoted) {
          result.className = "verify-result success";
          result.textContent = "เคลียร์ข้อมูลและถอดยศ STAR สำเร็จแล้ว (ไม่สามารถดึงข้อมูลการ์ด STAR ได้เนื่องจากถูกถอดยศแล้ว)";
        } else {
          throw loadErr;
        }
      }


    } catch (e) {
      result.classList.add("error");
      result.textContent = e.message;
    } finally {
      clearBtn.disabled = false;
    }
  };
}

initVerifyUserProfile();


