import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../AppContext.jsx";
import { useToast } from "../effects/Toast.jsx";
import { useProgressBar } from "../effects/ProgressBar.jsx";
import Typewriter from "../effects/Typewriter.jsx";
import MagneticButton from "../effects/MagneticButton.jsx";
import AuthPanel from "./AuthPanel.jsx";
import CreationPanel from "./CreationPanel.jsx";
import CampaignInfoCard from "./CampaignInfoCard.jsx";
import TimelineCard from "./TimelineCard.jsx";
import ConditionsCard from "./ConditionsCard.jsx";
import ContentCard from "./ContentCard.jsx";
import PreviewCard from "./PreviewCard.jsx";
import HistoryCard from "./HistoryCard.jsx";
import LogCard from "./LogCard.jsx";
import ModeOptionsDialog from "./ModeOptionsDialog.jsx";
import CampaignStatusDialog from "./CampaignStatusDialog.jsx";
import CreatePreviewDialog from "./CreatePreviewDialog.jsx";
import { DEFAULT_CATEGORIES } from "../../data/categories.js";
import { CAMPAIGN_STATUS_OPTIONS } from "../../data/mockPools.js";
import { GRAPHQL_CREATE, GRAPHQL_DELETE, Q_BRANDS, Q_CATEGORIES, Q_COUPONS } from "../../lib/queries.js";
import {
  buildDatesByStatus, buildStatusChangePayload, buildVariants, campaignStatusText,
  computeTimeline, createOne, flattenCategories, payloadFor, randomSectionText
} from "../../lib/campaign.js";
import { loadHistory, persistHistory, withNewHistoryItem } from "../../lib/history.js";
import { cleanToken } from "../../lib/graphql.js";
import { uid } from "../../lib/utils.js";

const PREVIEW_PLACEHOLDER = 'กด "สร้าง Preview" เพื่อดู variables ที่จะส่ง';

// ค่าเริ่มต้นของฟอร์ม = ผลของ resetForm() เดิมตอนเปิดหน้า
function initialForm() {
  return {
    title: "", slug: "", brandSearch: "", brandId: "", categoryId: "",
    coverImage: "", genCodeSocialType: "",
    campaignStatus: "registering", campaignStatusLabel: "เปิดลงทะเบียน",
    dates: computeTimeline("registering"),
    maxRegister: 150, maxQuota: 120,
    sections: [{ id: uid(), text: randomSectionText() }],
    mode: "bulk", modeOptionsLabel: "Bulk", count: 5
  };
}

/**
 * state + ref คู่กัน: ref อัปเดตทันที (sync) เพื่อให้ async flow
 * (สร้างหลายกิจกรรม, โหลดตัวเลือก) อ่านค่าล่าสุดได้เหมือนตอนอ่านจาก DOM เดิม
 */
function useSyncedState(initial) {
  const [state, setState] = useState(initial);
  const ref = useRef(state);
  const update = useCallback(updater => {
    const next = typeof updater === "function" ? updater(ref.current) : updater;
    ref.current = next;
    setState(next);
  }, []);
  return [state, update, ref];
}

export default function StarTab({ active, launchConfetti }) {
  const {
    environment, setEnvironment, envRef, token, setToken, getToken,
    setApiOnline, logs, log, clearLogs, gql
  } = useApp();
  const showToast = useToast();
  const progress = useProgressBar();

  const [form, updateForm, formRef] = useSyncedState(initialForm);
  const setField = useCallback((name, value) => updateForm(f => ({ ...f, [name]: value })), [updateForm]);
  const setDate = useCallback((id, value) => updateForm(f => ({ ...f, dates: { ...f.dates, [id]: value } })), [updateForm]);

  const [options, updateOptions, optionsRef] = useSyncedState({
    brands: [], categoryGroups: DEFAULT_CATEGORIES, coupons: []
  });
  const loadedCategories = useMemo(() => flattenCategories(options.categoryGroups), [options.categoryGroups]);

  const [history, updateHistory, historyRef] = useSyncedState(loadHistory);
  const replaceHistory = useCallback(next => { persistHistory(next); updateHistory(next); }, [updateHistory]);
  const addHistoryItem = useCallback(item => replaceHistory(withNewHistoryItem(historyRef.current, item)), [replaceHistory, historyRef]);

  const [flashSignal, setFlashSignal] = useState(0);
  const [payloadPreview, setPayloadPreview] = useState(PREVIEW_PLACEHOLDER);
  const [creating, setCreating] = useState(false);

  // dialogs
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, historyIndex: null });
  const [statusChoice, setStatusChoice] = useState("registering");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewVariants, setPreviewVariants] = useState([]);
  const pendingRef = useRef({ publish: true, environment: "sit", statusText: "-" });

  // ===== โหลด Category / Brand / Coupon =====
  const loadedEnvsRef = useRef(new Set());
  const optionsLoadingRef = useRef(false);
  const pendingEnvRef = useRef(null);

  const loadAllOptions = useCallback(async (env) => {
    log("กำลังดึง Category, Brand และ Coupon จากระบบ " + env + "...");
    try {
      const data = await gql(
        Q_CATEGORIES,
        { limit: 50, offset: 0, type: "brandCampaign", filter: { name: "" } },
        env
      );
      const groups = data.categoriesV2 || [];
      const flat = flattenCategories(groups);
      updateOptions(o => ({ ...o, categoryGroups: groups }));
      // เหมือน <select> เดิม: ค่าที่เลือกอยู่หายไปจากรายการใหม่ → กลายเป็นว่าง
      updateForm(f => ({
        ...f,
        categoryId: flat.some(c => String(c.id) === String(f.categoryId)) ? f.categoryId : ""
      }));
      log(`โหลด Category ${flat.length} รายการ`, "ok");

      const cData = await gql(
        Q_COUPONS,
        { filter: { name: "" }, limit: 15, offset: 0 },
        env
      ).catch(() => ({}));
      const loadedCoupons = cData.coupons || [];

      // รวม Brands จาก Coupons
      const brandMap = new Map();
      for (const coupon of loadedCoupons) {
        const brand = coupon.brand;
        if (brand?.id) {
          brandMap.set(brand.id, { id: brand.id, name: brand.name, seoSlugUrl: brand.seoSlugUrl });
        }
      }

      const bData = await gql(
        Q_BRANDS,
        { name: "", limit: 15, offset: 0, filter: "publishOnly" },
        env
      ).catch(() => ({}));

      const extraBrands = bData.searchAllByName?.brands || [];
      for (const brand of extraBrands) {
        if (brand.id) {
          brandMap.set(brand.id, { id: brand.id, name: brand.name, seoSlugUrl: brand.seoSlugUrl });
        }
      }

      const loadedBrands = [...brandMap.values()];
      updateOptions(o => ({ ...o, brands: loadedBrands, coupons: loadedCoupons }));

      // Auto-select coupon และ brand ที่ตรงกันอัตโนมัติ
      updateForm(f => {
        const brandValid = loadedBrands.some(b => String(b.id) === String(f.brandId)) ? f.brandId : "";
        let brandId = brandValid;
        if (loadedCoupons.length > 0) {
          const first = loadedCoupons[0];
          if (first.brand?.id) brandId = String(first.brand.id);
        } else if (loadedBrands.length > 0 && !brandValid) {
          brandId = String(loadedBrands[0].id);
        }
        let categoryId = f.categoryId;
        if (flat.length > 0 && !categoryId) categoryId = String(flat[0].id);
        return { ...f, brandId, categoryId };
      });

      setApiOnline(true);
      log(`โหลดตัวเลือกสำเร็จ: Category ${flat.length}, Brand ${loadedBrands.length}, Coupon ${loadedCoupons.length} รายการ`, "ok");
      return true;
    } catch (e) {
      log(`โหลดตัวเลือกไม่สำเร็จ: ${e.message}`, "error");
      alert(`โหลดตัวเลือกไม่สำเร็จ: ${e.message}`);
      return false;
    }
  }, [gql, log, setApiOnline, updateForm, updateOptions]);

  const loadOptionsAutomatically = useCallback(async (force = false, env = envRef.current) => {
    if (!getToken(env)) return;
    if (!force && loadedEnvsRef.current.has(env)) return;

    if (optionsLoadingRef.current) {
      pendingEnvRef.current = env;
      return;
    }

    optionsLoadingRef.current = true;
    try {
      const loaded = await loadAllOptions(env);
      if (loaded) loadedEnvsRef.current.add(env);
    } finally {
      optionsLoadingRef.current = false;
      const nextEnvironment = pendingEnvRef.current;
      pendingEnvRef.current = null;
      if ((nextEnvironment && nextEnvironment !== env) || envRef.current !== env) {
        void loadOptionsAutomatically(true, envRef.current);
      }
    }
  }, [getToken, loadAllOptions, envRef]);

  // ตอนเปิดหน้า: โหลดตัวเลือกถ้ามี token อยู่แล้ว (เหมือน resetForm() เดิม)
  useEffect(() => {
    void loadOptionsAutomatically(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Token / Environment =====
  const optionsLoadTimer = useRef();
  const onTokenChange = (value) => {
    setToken(environment, value);
    clearTimeout(optionsLoadTimer.current);
    const cleaned = cleanToken(value);
    if (cleaned.split(".").length === 3) {
      optionsLoadTimer.current = setTimeout(() => {
        void loadOptionsAutomatically(true);
      }, 800);
    }
  };

  const onEnvironmentChange = (env) => {
    setEnvironment(env);
    setApiOnline(false);
    void loadOptionsAutomatically(false, env);
  };

  // ===== Brand search =====
  const onSearchBrand = async () => {
    try {
      const name = formRef.current.brandSearch.trim();
      const data = await gql(Q_BRANDS, { name, limit: 15, offset: 0, filter: "publishOnly" });
      const list = data.searchAllByName?.brands || [];
      updateOptions(o => ({ ...o, brands: list }));
      updateForm(f => ({
        ...f,
        brandId: list.some(b => String(b.id) === String(f.brandId)) ? f.brandId : ""
      }));
      log(`ค้นหา Brand "${name || "ทั้งหมด"}" ได้ ${list.length} รายการ`, "ok");
    } catch (e) {
      log(e.message, "error");
    }
  };

  // ===== Sections =====
  const addSection = (text = randomSectionText()) =>
    updateForm(f => ({ ...f, sections: [...f.sections, { id: uid(), text }] }));
  const changeSection = (id, text) =>
    updateForm(f => ({ ...f, sections: f.sections.map(s => (s.id === id ? { ...s, text } : s)) }));
  const removeSection = (id) =>
    updateForm(f => ({ ...f, sections: f.sections.filter(s => s.id !== id) }));

  // ===== สร้าง variants จากฟอร์ม (applyStatusTimeline + buildVariants) =====
  const buildFromForm = (overrides = {}) => {
    const f = { ...formRef.current, ...overrides };
    const dates = computeTimeline(f.campaignStatus) || f.dates;
    updateForm(prev => ({ ...prev, dates }));
    const snapshot = { ...f, dates, sections: f.sections.map(s => s.text) };
    const { brands, coupons } = optionsRef.current;
    return buildVariants(snapshot, {
      loadedBrands: brands,
      loadedCategories: flattenCategories(optionsRef.current.categoryGroups),
      loadedCoupons: coupons
    });
  };

  const onBuildPreview = () => {
    try {
      const variants = buildFromForm();
      setPayloadPreview(JSON.stringify(variants.length === 1 ? payloadFor(variants[0], false) : variants, null, 2));
      log(`สร้าง Preview ${variants.length} payload`, "ok");
    } catch (e) {
      setPayloadPreview(e.message);
      log(e.message, "error");
    }
  };

  const openCreatePreview = (publish = true) => {
    try {
      const variants = buildFromForm();
      pendingRef.current = {
        publish,
        environment: envRef.current,
        statusText: campaignStatusText(formRef.current.campaignStatus)
      };
      setPreviewVariants(variants);
      setPreviewDialogOpen(true);
    } catch (e) {
      log(e.message, "error");
      alert(e.message);
    }
  };

  const editPreviewVariant = (index, field, value) => {
    setPreviewVariants(list => list.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const createAllFromVariants = async (variants, publish, env) => {
    setCreating(true);
    progress.show(`กำลังสร้าง 0/${variants.length} กิจกรรม...`);
    let ok = 0;

    try {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const pct = Math.round((i / variants.length) * 90) + 5;
        progress.update(pct, `สร้างกิจกรรม ${i + 1}/${variants.length}: ${v.title || "..."}`);

        try {
          const r = await createOne(gql, v, publish, env, { log, setApiOnline });
          addHistoryItem({
            ...v, id: r.id, environment: env,
            status: "success", published: r.published,
            campaignStatus: formRef.current.campaignStatus
          });
          ok++;
          log(`สร้างสำเร็จ ID=${r.id} | ${v.title}`, "ok");
          setFlashSignal(n => n + 1);
        } catch (e) {
          addHistoryItem({
            ...v, id: null, environment: env,
            status: "failed", error: e.message,
            campaignStatus: formRef.current.campaignStatus
          });
          log(`สร้างไม่สำเร็จ | ${v.title} | ${e.message}`, "error");
        }
      }

      if (ok > 0) {
        progress.done(`สร้างสำเร็จ ${ok}/${variants.length} กิจกรรม! 🎉`);
        showToast(`✅ สร้างสำเร็จ ${ok}/${variants.length} กิจกรรม`, "success", 4000);
        if (ok === variants.length) launchConfetti();
      } else {
        progress.error("สร้างไม่สำเร็จทั้งหมด");
        showToast("❌ สร้างไม่สำเร็จ กรุณาตรวจ API Log", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmCreateFromPreview = async () => {
    if (!previewVariants.length) {
      alert("ไม่พบข้อมูลที่จะสร้าง");
      return;
    }
    const variants = previewVariants.map(v => ({
      ...v,
      title: (v.title || "").trim(),
      seoSlugUrl: (v.seoSlugUrl || "").trim()
    }));
    setPreviewDialogOpen(false);
    await createAllFromVariants(variants, pendingRef.current.publish, pendingRef.current.environment);
  };

  // flow "สร้างด่วน" (createAll เดิม)
  const createAll = async (publish = true, modeOverride) => {
    const mode = modeOverride ?? formRef.current.mode;
    let resetQuickToBulk = false;

    try {
      const overrides = { mode };
      if (mode === "quick") {
        overrides.campaignStatus = "registering";
        overrides.campaignStatusLabel = "เปิดลงทะเบียน";
        updateForm(f => ({ ...f, ...overrides }));
        setStatusChoice("registering");
      }

      const env = envRef.current;
      const variants = buildFromForm(overrides);
      if (!confirm(`กำลังจะสร้าง ${variants.length} กิจกรรม${publish ? " และ Publish" : ""} ดำเนินการหรือไม่?`)) return;
      resetQuickToBulk = mode === "quick";
      setCreating(true);

      const campaignStatus = formRef.current.campaignStatus;
      let ok = 0;
      for (const v of variants) {
        try {
          const r = await createOne(gql, v, publish, env, { log, setApiOnline });
          addHistoryItem({
            ...v, id: r.id, environment: env,
            status: "success", published: r.published, campaignStatus
          });
          ok++;
          log(`สร้างสำเร็จ ID=${r.id} | ${v.title}`, "ok");
        } catch (e) {
          addHistoryItem({ ...v, id: null, environment: env, status: "failed", error: e.message });
          log(`สร้างไม่สำเร็จ | ${v.title} | ${e.message}`, "error");
        }
      }
      alert(`เสร็จแล้ว: สำเร็จ ${ok}/${variants.length}`);
    } catch (e) {
      log(e.message, "error");
      alert(e.message);
    } finally {
      setCreating(false);
      if (resetQuickToBulk) {
        updateForm(f => ({ ...f, mode: "bulk", modeOptionsLabel: "Bulk", count: 5 }));
      }
    }
  };

  const onQuickClick = async () => {
    updateForm(f => ({ ...f, mode: "quick" }));

    const env = envRef.current;
    if (!getToken(env)) {
      alert(`กรุณาใส่ Bearer Token สำหรับ ${env.toUpperCase()} ก่อน`);
      return;
    }

    if (!loadedEnvsRef.current.has(env)) {
      const loaded = await loadAllOptions(env);
      if (!loaded) return;
      loadedEnvsRef.current.add(env);
    }

    await createAll(true, "quick");
  };

  // ===== Mode dialog =====
  const onSelectMode = (value, label) => {
    updateForm(f => {
      // syncCountInputByMode
      let count = f.count;
      if (value === "manual") count = 1;
      else if (!count || Number(count) < 1) count = 5;
      return { ...f, mode: value, modeOptionsLabel: label, count };
    });
    setModeDialogOpen(false);
  };

  // ===== Campaign status dialog =====
  const closeStatusDialog = useCallback(() => setStatusDialog({ open: false, historyIndex: null }), []);

  const onChooseStatus = () => {
    setStatusChoice(formRef.current.campaignStatus);
    setStatusDialog({ open: true, historyIndex: null });
  };

  const onChangeHistoryStatus = (index) => {
    const item = historyRef.current[index];
    if (!item || item.status !== "success" || !item.id) {
      alert("ไม่พบรายการหรือกิจกรรมนี้สร้างไม่สำเร็จ");
      return;
    }
    const env = item.environment || envRef.current;
    if (!getToken(env)) {
      alert(`ไม่พบ Bearer Token สำหรับ ${env.toUpperCase()}`);
      return;
    }
    setStatusDialog({ open: true, historyIndex: index });
  };

  const applyCampaignStatus = async () => {
    const option = CAMPAIGN_STATUS_OPTIONS.find(o => o.value === statusChoice);
    if (!option) {
      alert("กรุณาเลือกสถานะกิจกรรม");
      return;
    }

    // โหมดปกติ (สร้างกิจกรรมใหม่)
    if (statusDialog.historyIndex === null) {
      const dates = computeTimeline(option.value);
      updateForm(f => ({
        ...f,
        campaignStatus: option.value,
        campaignStatusLabel: option.label,
        dates: dates || f.dates
      }));
      closeStatusDialog();
      return;
    }

    // โหมดเปลี่ยนสถานะ History
    const historyIndex = statusDialog.historyIndex;
    const item = historyRef.current[historyIndex];

    if (!item || !item.id) {
      alert("ไม่พบรายการใน History");
      closeStatusDialog();
      return;
    }

    const env = item.environment || envRef.current;
    const statusValue = option.value;

    if (!statusValue) {
      alert("กรุณาเลือกสถานะที่ต้องการ (ไม่สามารถใช้ 'กำหนดเวลาเอง' ในโหมดนี้)");
      return;
    }

    closeStatusDialog();

    let newDates;
    try {
      newDates = buildDatesByStatus(statusValue);
    } catch (e) {
      alert(`คำนวณวันที่ไม่สำเร็จ: ${e.message}`);
      return;
    }

    const payload = buildStatusChangePayload(item, newDates);
    log(`กำลังเปลี่ยนสถานะกิจกรรม ID=${item.id} เป็น "${statusValue}"...`);

    try {
      const data = await gql(GRAPHQL_CREATE, payload, env);
      const result = data?.createOrUpdateBrandCampaign;

      if (!result?.successful) {
        const detail = (result?.errors || [])
          .map(x => `${x.path ? "[" + x.path + "] " : ""}${x.message}`)
          .join(" | ") || "Update failed";
        throw new Error(detail);
      }

      log(`เปลี่ยนสถานะสำเร็จ ID=${item.id} → "${statusValue}"`, "ok");
      replaceHistory(historyRef.current.map((h, i) =>
        i === historyIndex ? { ...h, campaignStatus: statusValue } : h
      ));
      alert(`✅ เปลี่ยนสถานะสำเร็จ!\nID: ${item.id}\nชื่อ: ${item.title}\nสถานะใหม่: ${statusValue}`);
    } catch (e) {
      log(`เปลี่ยนสถานะไม่สำเร็จ ID=${item.id}: ${e.message}`, "error");
      alert(`❌ เปลี่ยนสถานะไม่สำเร็จ\nID: ${item.id}\nError: ${e.message}`);
    }
  };

  // ===== History =====
  const markHistoryDeleted = (index) => {
    const item = historyRef.current[index];
    if (!item || item.status !== "success" || !item.id) return;
    replaceHistory(historyRef.current.map((h, i) =>
      i === index ? { ...h, deletedInBackOffice: !h.deletedInBackOffice } : h
    ));
  };

  const deleteSelectedHistory = async (selectedIndexes) => {
    const env = envRef.current;
    const indexes = [...selectedIndexes].sort((a, b) => b - a);

    if (!indexes.length) {
      alert("กรุณาเลือกกิจกรรมที่ต้องการลบ");
      return;
    }

    if (!getToken(env)) {
      alert(`ไม่พบ Bearer Token สำหรับ ${env.toUpperCase()}`);
      return;
    }

    if (!confirm(`ลบกิจกรรมที่เลือก ${indexes.length} รายการจาก ${env.toUpperCase()}?`)) {
      return;
    }

    let deleted = 0;
    let failed = 0;

    for (const index of indexes) {
      const item = historyRef.current[index];

      if (!item || item.environment !== env || !item.id) {
        failed++;
        continue;
      }

      try {
        const data = await gql(GRAPHQL_DELETE, { id: Number(item.id) }, env);
        const result = data?.deleteBrandCampaign;
        if (!result?.successful) {
          throw new Error(
            (result?.errors || []).map(error => error.message).join(" | ") || "Delete failed"
          );
        }
        const updated = [...historyRef.current];
        updated.splice(index, 1);
        replaceHistory(updated);
        deleted++;
      } catch (error) {
        failed++;
        log(`ลบกิจกรรม ID ${item.id} ไม่สำเร็จ: ${error.message}`, "error");
      }
    }

    alert(`ลบสำเร็จ ${deleted} รายการ${failed ? ` · ลบไม่สำเร็จ ${failed} รายการ ดูรายละเอียดใน API Log` : ""}`);
  };

  const clearHistory = () => {
    const env = envRef.current;
    const list = historyRef.current;

    const canClear = item =>
      item.environment === env &&
      (item.status === "failed" || item.deletedInBackOffice === true);

    const clearableCount = list.filter(canClear).length;

    if (!clearableCount) {
      alert("ไม่มีรายการที่สร้างไม่สำเร็จหรือทำเครื่องหมายว่าลบจาก Back Office แล้ว");
      return;
    }

    if (!confirm(`ล้าง History ${clearableCount} รายการของ ${env.toUpperCase()}?`)) {
      return;
    }

    replaceHistory(list.filter(item => !canClear(item)));
  };

  return (
    <>
      <main className={`container tab-panel${active ? " active" : ""}`} id="tab-star">
        <section className="hero">
          <div>
            <div className="eyebrow">QA / Mock Data Generator</div>
            <Typewriter text="สร้างกิจกรรม Sale Here STAR" speed={55} />
            <p>สร้างข้อมูลทดสอบหลายกิจกรรมจาก API จริง โดยไม่ต้องกรอกหน้า Back Office ทีละรายการ</p>
          </div>
        </section>

        <section className="card security">
          <div className="grid two endpoint-layout">
            <AuthPanel
              environment={environment}
              onEnvironmentChange={onEnvironmentChange}
              token={token}
              onTokenChange={onTokenChange}
            />

            <CreationPanel
              mode={form.mode}
              modeOptionsLabel={form.modeOptionsLabel}
              count={form.count}
              countDisabled={form.mode === "manual"}
              onQuickClick={onQuickClick}
              onOpenModeOptions={() => setModeDialogOpen(true)}
              onCreate={() => openCreatePreview(true)}
              onCountChange={value => setField("count", value)}
            />
          </div>
          <div className="warning">
            💡 <b>วิธีนำ Admin Token ที่ถูกต้องมาใส่:</b>
            <ol style={{ margin: "6px 0 0 18px", padding: 0 }}>
              <li>เปิดแท็บใหม่ เข้าเว็บ <b>Sale Here Back Office (SIT / UAT Admin)</b> และ Login</li>
              <li>กด <code>F12</code> ไปที่แท็บ <b>Network</b> พิมพ์กรองคำว่า <code>graphql</code></li>
              <li>คลิกเปลี่ยนหน้าเมนูใน Admin 1 ครั้ง แล้วคลิกที่แถว <b>graphql</b> ที่ขึ้นมาใหม่</li>
              <li>ดูแท็บ <b>Headers</b> &gt; หัวข้อ <b>Request Headers</b> &gt; คัดลอกค่าจาก <b>authorization</b>
                (ขึ้นต้นด้วย <code>eyJ...</code>) มาวาง</li>
            </ol>
          </div>
        </section>

        <CampaignInfoCard
          form={form}
          setField={setField}
          brands={options.brands}
          categoryGroups={options.categoryGroups}
          onSearchBrand={onSearchBrand}
        />

        <TimelineCard
          campaignStatus={form.campaignStatus}
          campaignStatusLabel={form.campaignStatusLabel}
          dates={form.dates}
          setDate={setDate}
          onChooseStatus={onChooseStatus}
        />

        <ConditionsCard form={form} setField={setField} />

        <ContentCard
          sections={form.sections}
          onAdd={addSection}
          onChange={changeSection}
          onRemove={removeSection}
        />

        <PreviewCard payloadPreview={payloadPreview} onBuildPreview={onBuildPreview} />

        <section className="action-bar">
          <MagneticButton
            id="createAndPublishBtn" className="primary dark"
            onClick={() => openCreatePreview(true)} disabled={creating}
          >
            สร้างกิจกรรม
          </MagneticButton>
        </section>

        <HistoryCard
          history={history}
          environment={environment}
          flashSignal={flashSignal}
          onDeleteSelected={deleteSelectedHistory}
          onMarkDeleted={markHistoryDeleted}
          onChangeStatus={onChangeHistoryStatus}
          onClearHistory={clearHistory}
        />

        <LogCard logs={logs} onClear={clearLogs} />
      </main>

      <ModeOptionsDialog
        open={modeDialogOpen}
        mode={form.mode}
        onSelect={onSelectMode}
        onClose={() => setModeDialogOpen(false)}
      />

      <CampaignStatusDialog
        open={statusDialog.open}
        choice={statusChoice}
        onChoiceChange={setStatusChoice}
        onApply={applyCampaignStatus}
        onClose={closeStatusDialog}
      />

      <CreatePreviewDialog
        open={previewDialogOpen}
        variants={previewVariants}
        statusText={pendingRef.current.statusText}
        onEdit={editPreviewVariant}
        onConfirm={confirmCreateFromPreview}
        onClose={() => setPreviewDialogOpen(false)}
      />
    </>
  );
}
