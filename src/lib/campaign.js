// ==========================================
// Logic การสร้างกิจกรรม (pure function ไม่แตะ DOM)
// ย้ายจาก app.js: applyStatusTimeline / getBaseForm / buildVariants / createOne
// ==========================================
import { addDays, localInput, msFromLocal, randomChoice, randomInt, slugify } from "./utils.js";
import { COVER_IMAGE_URLS, DEFAULT_SECTION_TEXTS } from "../data/mockPools.js";
import { GRAPHQL_CREATE, GRAPHQL_PUBLISH } from "./queries.js";

export const DATE_FIELDS = [
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

export const TIMELINE_OFFSETS = {
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

export const REGISTER_START_OFFSET_BY_STATUS = {
  beforeRegister: 1,
  registering: -2,
  registrationClosed: -5,
  draft: -8,
  review: -14,
  ended: -19
};

export function emptyDates() {
  return Object.fromEntries(DATE_FIELDS.map(id => [id, ""]));
}

// คืนค่าวันที่ทุกช่อง (รูปแบบ datetime-local) ตามสถานะ — ถ้า status ว่างคืน null (ไม่แตะค่าเดิม)
export function computeTimeline(status) {
  if (!status) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const registerStart = addDays(today, REGISTER_START_OFFSET_BY_STATUS[status]);
  const result = {};
  for (const [fieldId, offset] of Object.entries(TIMELINE_OFFSETS)) {
    result[fieldId] = localInput(addDays(registerStart, offset));
  }
  return result;
}

// คำนวณ variables วันที่ทั้งหมดจากสถานะที่ต้องการ (ms timestamp string)
export function buildDatesByStatus(status) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registerStartOffset = REGISTER_START_OFFSET_BY_STATUS[status];
  if (registerStartOffset === undefined) {
    throw new Error(`ไม่รู้จักสถานะ: ${status}`);
  }

  const registerStart = addDays(today, registerStartOffset);
  const result = {};
  for (const [fieldId, offset] of Object.entries(TIMELINE_OFFSETS)) {
    const date = addDays(registerStart, offset);
    result[fieldId] = String(date.getTime());
  }
  return result;
}

export function campaignStatusText(status) {
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

export function randomCoverImageUrl() {
  if (!COVER_IMAGE_URLS.length) {
    throw new Error("ยังไม่มี URL ภาพ Cover สำหรับสุ่ม");
  }
  return COVER_IMAGE_URLS[Math.floor(Math.random() * COVER_IMAGE_URLS.length)];
}

export function randomSectionText() {
  const index = Math.floor(Math.random() * DEFAULT_SECTION_TEXTS.length);
  return DEFAULT_SECTION_TEXTS[index];
}

export function flattenCategories(groups) {
  const list = [];
  for (const group of groups || []) {
    list.push({ id: group.id, name: group.name });
    for (const child of group.children || []) list.push({ id: child.id, name: child.name });
  }
  return list;
}

// sections จาก UI → ตัดช่องว่างและข้อความ default ออก
function sectionsFromForm(sectionTexts) {
  return (sectionTexts || [])
    .map(value => ({ type: "text", text: { type: "text", value } }))
    .filter(section => {
      const value = section.text.value.trim();
      return value && !DEFAULT_SECTION_TEXTS.includes(value);
    });
}

function generatedActivitySections(activity, { loadedBrands, loadedCategories }) {
  const brandId = activity.brandId;
  const categoryId = activity.categories?.[0]?.id;

  const brand = loadedBrands.find(item => Number(item.id) === Number(brandId));
  const category = loadedCategories.find(item => Number(item.id) === Number(categoryId));

  const socialLabels = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok" };

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

  return [{ type: "text", text: { type: "text", value: content } }];
}

function randomCouponId(loadedCoupons) {
  const coupons = loadedCoupons.filter(coupon => Number(coupon.id) > 0);
  if (!coupons.length) {
    throw new Error("ไม่พบ Coupon สำหรับสุ่ม กรุณากดโหลด Brand / Category / Coupon");
  }
  return Number(randomChoice(coupons).id);
}

/**
 * @param {object} form  snapshot ของฟอร์ม
 *  { mode, count, brandId, categoryId, title, slug, coverImage, genCodeSocialType,
 *    maxRegister, maxQuota, sections:[string], dates:{...DATE_FIELDS} }
 */
export function getBaseForm(form) {
  const mode = form.mode;
  const brandId = Number(form.brandId) || null;
  const categoryId = Number(form.categoryId) || null;
  if (mode === "manual" && !brandId) {
    throw new Error("กรุณาเลือก Brand สำหรับโหมด Manual");
  }
  if (!categoryId) throw new Error("กรุณาเลือก Category");

  const missingDates = DATE_FIELDS.filter(id => !form.dates[id]);
  if (missingDates.length) {
    throw new Error("กรุณาเลือกสถานะกิจกรรม หรือกรอกวันที่ให้ครบทุกช่อง");
  }
  const title = (form.title || "").trim();
  const slug = (form.slug || "").trim();
  const cover = (form.coverImage || "").trim();
  const d = form.dates;

  return {
    title, seoSlugUrl: slug, brandId,
    coverImage: { imgPath: cover, width: 1200, height: 630 },
    sections: sectionsFromForm(form.sections),
    beginDate: msFromLocal(d.beginDate), endDate: msFromLocal(d.endDate),
    startReviewDate: msFromLocal(d.startReviewDate), endReviewDate: msFromLocal(d.endReviewDate),
    startRegisterDate: msFromLocal(d.startRegisterDate), endRegisterDate: msFromLocal(d.endRegisterDate),
    startShippingDate: msFromLocal(d.startShippingDate),
    startDraftDate: msFromLocal(d.startDraftDate), endDraftDate: msFromLocal(d.endDraftDate),
    maxRegister: Number(form.maxRegister || 0),
    maxQuota: Number(form.maxQuota || 0),
    isApplicationForm: true,
    isAllowLink: true,
    brands: brandId ? [{ id: brandId }] : [],
    questions: [],
    acceptQuestions: [],
    categories: [{ id: categoryId }],
    interests: null,
    eCatalogIds: null,
    suggestedItem: { type: "coupon", entityId: null },
    genCodeSocialType: form.genCodeSocialType || null
  };
}

/**
 * สร้าง variants ตามโหมด
 * @param {object} form  (ดู getBaseForm)
 * @param {{loadedBrands:Array, loadedCategories:Array, loadedCoupons:Array}} ctx
 */
export function buildVariants(form, ctx) {
  const { loadedBrands, loadedCategories, loadedCoupons } = ctx;
  const base = getBaseForm(form);
  const mode = form.mode;
  const count = mode === "quick"
    ? 1
    : Math.min(50, Math.max(1, Number(form.count) || 1));

  if (mode === "manual") {
    const selectedBrand = loadedBrands.find(
      brand => Number(brand.id) === base.brandId && brand.seoSlugUrl?.trim()
    );

    if (!selectedBrand) {
      throw new Error("Brand ที่เลือกไม่มี seoSlugUrl กรุณาโหลด Brand ใหม่");
    }

    const brandSlug = selectedBrand.seoSlugUrl.trim();

    if (!base.title) base.title = `EP.${Date.now()}-${brandSlug}`;
    if (!base.seoSlugUrl) base.seoSlugUrl = `${brandSlug}-${Date.now()}`;
    base.suggestedItem.entityId = randomCouponId(loadedCoupons);
    if (!base.coverImage.imgPath) base.coverImage.imgPath = randomCoverImageUrl();
    if (!base.sections.length) base.sections = generatedActivitySections(base, ctx);

    return [base];
  }

  const brandsWithSlug = loadedBrands.filter(brand => brand.seoSlugUrl?.trim());

  if (!brandsWithSlug.length) {
    throw new Error("ไม่พบ Brand ที่มี seoSlugUrl กรุณาโหลด Brand ใหม่");
  }

  const variants = [];

  for (let i = 0; i < count; i++) {
    const copy = structuredClone(base);
    if (!copy.coverImage.imgPath) copy.coverImage.imgPath = randomCoverImageUrl();
    const stamp = Date.now() + i;
    copy.suggestedItem.entityId = randomCouponId(loadedCoupons);
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

    if (mode === "quick") {
      if (!loadedCategories.length) {
        throw new Error("ไม่พบ Category สำหรับสุ่ม กรุณาโหลดตัวเลือกใหม่");
      }

      copy.title = `EP.${stamp}-${brandSlug}`;
      copy.seoSlugUrl = `${slugify(brandSlug)}-${stamp}`;
      copy.coverImage.imgPath = randomCoverImageUrl();
      copy.suggestedItem.entityId = randomCouponId(loadedCoupons);
      copy.maxRegister = randomInt(1, 300);
      copy.maxQuota = randomInt(1, Math.max(1, copy.maxRegister));

      const randomCategory = randomChoice(loadedCategories);
      copy.categories = [{ id: Number(randomCategory.id) }];

      copy.genCodeSocialType = randomChoice([null, "facebook", "instagram", "tiktok"]);

      copy.sections = generatedActivitySections(copy, ctx);
    }

    if (mode === "bulk") {
      copy.suggestedItem.entityId = randomCouponId(loadedCoupons);
    }

    if (mode === "random") {
      copy.maxRegister = randomInt(1, 300);
      copy.maxQuota = randomInt(1, Math.max(1, copy.maxRegister));
      copy.suggestedItem.entityId = randomCouponId(loadedCoupons);

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
      copy.endRegisterDate = String(addDays(beginDate, randomInt(3, 7)).getTime());
      copy.startShippingDate = String(addDays(beginDate, 8).getTime());
      copy.startDraftDate = String(addDays(beginDate, 9).getTime());
      copy.endDraftDate = String(
        addDays(beginDate, Math.max(10, Math.floor((endDate - beginDate) / 86400000) - 1)).getTime()
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
      copy.sections = generatedActivitySections(copy, ctx);
    }

    variants.push(copy);
  }

  return variants;
}

export function payloadFor(v, publish = false) {
  return { ...v, isPublish: publish, isRequiredImage: false };
}

/**
 * ยิงสร้างกิจกรรม 1 รายการ (+publish)
 * @param {Function} gql  (query, variables, environment) => data
 * @param {{log:Function, setApiOnline:Function}} hooks
 */
export async function createOne(gql, v, publish, environment, hooks) {
  const payload = payloadFor(v, false);
  hooks.log(`กำลังยิงสร้าง: ${v.title} (Brand #${v.brandId}, Category #${v.categories?.[0]?.id})...`);

  const data = await gql(GRAPHQL_CREATE, payload, environment);
  const result = data?.createOrUpdateBrandCampaign;
  if (!result?.successful) {
    console.error("[Create Campaign Response]", result);
    const detail = (result?.errors || []).map(x => `${x.path ? "[" + x.path + "] " : ""}${x.message}`).join(" | ") || "Create failed";
    if (detail.includes("เข้าสู่ระบบ") || detail.toLowerCase().includes("unauthorized")) {
      hooks.setApiOnline(false);
      throw new Error(`[Server ตอบ: ${detail}] สิทธิ์ของผู้ใช้ไม่สามารถสร้างกิจกรรมแบรนด์นี้ได้ หรือ Token ไม่มีสิทธิ์ Admin`);
    }
    throw new Error(detail);
  }
  const id = result.entity?.id;
  if (publish && id) {
    const p = await gql(GRAPHQL_PUBLISH, { id: Number(id) }, environment);
    const pr = p.publish;
    if (!pr?.successful) throw new Error((pr?.errors || []).map(x => x.message).join(" | ") || "Publish failed");
  }
  return { id: Number(id), published: !!publish };
}

// payload สำหรับ "เปลี่ยนสถานะ" กิจกรรมใน history (update กิจกรรมเดิมด้วยวันที่ใหม่)
export function buildStatusChangePayload(item, newDates) {
  return {
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
    ...newDates
  };
}
