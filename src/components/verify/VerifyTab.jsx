import { useCallback, useRef, useState } from "react";
import { useApp } from "../../AppContext.jsx";
import { useToast } from "../effects/Toast.jsx";
import { checkGraphQLErrors, cleanToken, frontGql as rawFrontGql } from "../../lib/graphql.js";
import {
  M_CHANGE_USER_VERIFY_STATE_FOR_TEST, M_EDIT_PROFILE_NICKNAME,
  M_RESET_STAR_PROFILE_FOR_TEST, Q_STAR_PROFILE_OVERVIEW
} from "../../lib/queries.js";
import {
  MOCK_DATA_HANDLERS, VERIFY_FRONT_TOKEN_KEY, buildVerifyRows,
  getVerifyTokenHistory, pruneVerifyTokenHistory, saveVerifyTokenHistory
} from "../../lib/verify.js";
import { isTokenExpired } from "../../lib/token.js";
import VerifyRow from "./VerifyRow.jsx";

const NOT_LOADED = "ยังไม่ได้โหลดข้อมูล";

function CountLabel({ id, rows }) {
  if (!rows) return <span id={id}>{NOT_LOADED}</span>;
  const completed = rows.filter(row => row.values.length).length;
  const complete = completed === rows.length;
  return (
    <span
      id={id}
      style={{
        color: complete ? "var(--green, #059669)" : "var(--muted)",
        fontWeight: complete ? "700" : "normal"
      }}
    >
      ครบ {completed}/{rows.length} ข้อ
    </span>
  );
}

export default function VerifyTab({ active }) {
  const { envRef } = useApp();
  const showToast = useToast();

  const [frontToken, setFrontTokenState] = useState(() => localStorage.getItem(VERIFY_FRONT_TOKEN_KEY) || "");
  const tokenRef = useRef(frontToken);
  const setFrontToken = useCallback(value => {
    tokenRef.current = value;
    setFrontTokenState(value);
  }, []);

  const [tokenHistory, setTokenHistory] = useState(() => pruneVerifyTokenHistory());
  const [selectedTel, setSelectedTel] = useState("");
  const [overview, setOverview] = useState(null); // { mainRows, readyRows, profile }
  const [result, setResult] = useState({ hidden: true, className: "verify-result", text: "" });
  const [checked, setChecked] = useState(() => new Set());
  const [subChecked, setSubChecked] = useState(() => new Set());
  const [rankChecked, setRankChecked] = useState(false);
  const [kycBusy, setKycBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [selectAllLabel, setSelectAllLabel] = useState("☑️ เลือกทั้งหมด");

  const textareaRef = useRef(null);

  const showResult = useCallback((text, kind = "") => {
    setResult({ hidden: false, className: `verify-result${kind ? " " + kind : ""}`, text });
  }, []);

  // frontGql ที่ผูก token/environment ปัจจุบัน
  const fgql = useCallback((query, variables) =>
    rawFrontGql({ environment: envRef.current, token: tokenRef.current }, query, variables),
  [envRef]);

  // ===== Token textarea: ขยายตามเนื้อหาเมื่อโฟกัส / ย่อกลับเมื่อออกจากช่อง =====
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const onTokenInput = (e) => {
    const value = e.target.value;
    setFrontToken(value);
    const val = value.trim();
    if (val) localStorage.setItem(VERIFY_FRONT_TOKEN_KEY, val);
    else localStorage.removeItem(VERIFY_FRONT_TOKEN_KEY);
    if (document.activeElement === textareaRef.current) autoGrow();
  };

  const onTokenBlur = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "";
    el.scrollTop = 0;
  };

  // ===== โหลดข้อมูลการ์ด STAR =====
  const loadVerifyProfileOverview = useCallback(async () => {
    const data = await fgql(Q_STAR_PROFILE_OVERVIEW);
    const rows = buildVerifyRows(data);
    setOverview(rows);
    // render รายการใหม่ = checkbox ในลิสต์ถูก reset (เหมือน innerHTML เดิม)
    setChecked(new Set());
    setSubChecked(new Set());
    return rows.profile;
  }, [fgql]);

  const onLoad = async () => {
    const token = cleanToken(tokenRef.current);
    if (token) localStorage.setItem(VERIFY_FRONT_TOKEN_KEY, token);

    showResult("กำลังโหลดข้อมูล...");
    try {
      const profile = await loadVerifyProfileOverview();
      saveVerifyTokenHistory(token, profile);
      setTokenHistory(pruneVerifyTokenHistory());
      setSelectedTel(profile?.tel || "");
      showResult("โหลดข้อมูลสำเร็จ", "success");
    } catch (e) {
      showResult(e.message, "error");
    }
  };

  const onClearToken = () => {
    setSelectedTel("");
    setFrontToken("");
    localStorage.removeItem(VERIFY_FRONT_TOKEN_KEY);
    textareaRef.current?.focus();
  };

  const onHistorySelect = (tel) => {
    setSelectedTel(tel);
    if (!tel) return;

    const item = getVerifyTokenHistory().find(h => h.tel === tel);

    // เผื่อหมดอายุระหว่างที่เปิดหน้าค้างไว้
    if (!item || isTokenExpired(item.exp)) {
      setTokenHistory(pruneVerifyTokenHistory());
      showToast("Token ของเบอร์นี้หมดอายุแล้ว", "error");
      return;
    }

    setFrontToken(item.token);
    localStorage.setItem(VERIFY_FRONT_TOKEN_KEY, item.token);
    void onLoad();
  };

  // ===== checkbox =====
  const onCheck = (key, isChecked) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (isChecked) next.add(key); else next.delete(key);
      return next;
    });
  };

  // ติ๊กข้อย่อยตัวไหนก็ตาม → ติ๊กแถวหลักให้อัตโนมัติ
  const onSubCheck = (parentKey, subKey, isChecked) => {
    setSubChecked(prev => {
      const next = new Set(prev);
      if (isChecked) next.add(subKey); else next.delete(subKey);
      return next;
    });
    if (isChecked) onCheck(parentKey, true);
  };

  // key ของ checkbox ทุกตัวใน .verify-list เรียงตามลำดับ DOM
  const listKeys = overview
    ? [...overview.mainRows.filter(r => !r.isSelect), ...overview.readyRows].map(r => r.key)
    : [];
  const orderedChecked = () => listKeys.filter(k => checked.has(k));

  const onSelectAll = () => {
    if (!listKeys.length) return;
    const isAllChecked = listKeys.every(k => checked.has(k));
    setChecked(isAllChecked ? new Set() : new Set(listKeys));
    setSelectAllLabel(isAllChecked ? "☑️ เลือกทั้งหมด" : "⬜ ปลดเลือกทั้งหมด");
  };

  // ===== KYC dropdown =====
  const onKycChange = async (newState) => {
    showResult(`กำลังเปลี่ยนสถานะยืนยันตัวตนเป็น "${newState}"...`);
    setKycBusy(true);
    try {
      const data = await fgql(M_CHANGE_USER_VERIFY_STATE_FOR_TEST, { state: newState });
      const resp = data.changeUserVerifyStateForTest;
      if (!resp?.successful) {
        const msg = (resp?.errors || []).map(err => err.message).join(" | ") || "เปลี่ยนสถานะไม่สำเร็จ";
        throw new Error(msg);
      }
      showResult(`เปลี่ยนสถานะเป็น ${newState} สำเร็จ! กำลังอัปเดตข้อมูล...`, "success");
      await loadVerifyProfileOverview();
      showResult(`เปลี่ยนสถานะยืนยันตัวตนเป็น "${newState}" เรียบร้อยแล้ว`, "success");
    } catch (err) {
      showResult(err.message, "error");
    } finally {
      setKycBusy(false);
    }
  };

  // ===== ปุ่ม "เพิ่มข้อมูล" (Mock Data) =====
  const onAddMock = async () => {
    const selected = orderedChecked().filter(val => val !== "rank");

    if (!selected.length) {
      showResult("กรุณาติ๊กเลือกข้อที่ต้องการเพิ่มข้อมูลอย่างน้อย 1 ข้อ", "error");
      return;
    }

    if (!confirm(`ต้องการเพิ่มข้อมูล (Mock Data) จำนวน ${selected.length} รายการใช่ไหม?`)) {
      return;
    }

    setAdding(true);
    showResult("กำลังดำเนินการเพิ่มข้อมูล Mock Data...");

    const successList = [];
    const skippedList = [];
    const aboutSubs = [...subChecked];

    try {
      // วนลูปทำงานทีละข้อ: ข้อไหนติด Logic ให้ข้าม แล้วทำข้อถัดไป
      for (const key of selected) {
        const handler = MOCK_DATA_HANDLERS[key];
        if (!handler) continue;
        try {
          await handler.run({ frontGql: fgql, aboutSubs });
          successList.push(handler.title);
        } catch (err) {
          skippedList.push(`${handler.title} (${err.message})`);
        }
      }

      setChecked(new Set());

      await loadVerifyProfileOverview();

      if (skippedList.length === 0) {
        showResult(`✅ เพิ่มข้อมูลสำเร็จทั้งหมด ${successList.length} รายการ: ${successList.join(", ")}`, "success");
      } else if (successList.length > 0) {
        showResult(`✅ เพิ่มสำเร็จ ${successList.length} ข้อ: ${successList.join(", ")} | ⚠️ ข้าม ${skippedList.length} ข้อ: ${skippedList.join(" | ")}`, "success");
      } else {
        showResult(`❌ ไม่สามารถเพิ่มข้อมูลได้: ${skippedList.join(" | ")}`, "error");
      }
    } catch (err) {
      showResult(err.message, "error");
    } finally {
      setAdding(false);
    }
  };

  // ===== ปุ่ม "เคลียร์ข้อมูลที่เลือก" =====
  const onClearSelected = async () => {
    const selected = orderedChecked();
    if (rankChecked) selected.push("rank");

    if (!selected.length) {
      showResult("กรุณาเลือกข้อมูลที่ต้องการเคลียร์", "error");
      return;
    }

    if (!confirm(`ต้องการเคลียร์ข้อมูล ${selected.length} รายการใช่ไหม?`)) {
      return;
    }

    setClearing(true);
    showResult("กำลังเคลียร์ข้อมูล...");

    try {
      const data = await fgql(M_RESET_STAR_PROFILE_FOR_TEST, { steps: selected });
      const resetResult = data.resetStarProfileForTest;

      if (!resetResult?.successful) {
        const message = (resetResult?.errors || [])
          .map(error => error.message)
          .join(" | ") || "เคลียร์ข้อมูลไม่สำเร็จ";
        throw new Error(message);
      }

      // backend ไม่ล้างชื่อเล่นให้ในขั้น about → ล้างเองด้วย editProfile
      if (selected.includes("about")) {
        const nickRes = await fgql(M_EDIT_PROFILE_NICKNAME, { nickname: "" });
        checkGraphQLErrors(nickRes.editProfile);
      }

      setChecked(new Set());
      setRankChecked(false);

      showResult("เคลียร์ข้อมูลสำเร็จ กำลังโหลดข้อมูลล่าสุด...", "success");

      // ถ้ามีการถอดยศ rank ผู้ใช้อาจไม่สามารถโหลดโปรไฟล์ STAR ได้อีก
      const isRankDemoted = selected.includes("rank");
      try {
        await loadVerifyProfileOverview();
        showResult(isRankDemoted
          ? "เคลียร์ข้อมูลและถอดยศ STAR เรียบร้อยแล้ว (สถานะ STAR ถูกยกเลิก)"
          : "เคลียร์ข้อมูลสำเร็จ และโหลดข้อมูลล่าสุดแล้ว", "success");
      } catch (loadErr) {
        if (isRankDemoted) {
          showResult("เคลียร์ข้อมูลและถอดยศ STAR สำเร็จแล้ว (ไม่สามารถดึงข้อมูลการ์ด STAR ได้เนื่องจากถูกถอดยศแล้ว)", "success");
        } else {
          throw loadErr;
        }
      }
    } catch (e) {
      showResult(e.message, "error");
    } finally {
      setClearing(false);
    }
  };

  const profile = overview?.profile;

  return (
    <section className={`container tab-panel${active ? " active" : ""}`} id="tab-verify">
      <section className="card verify-card">
        <div className="card-title">
          <div><span className="step">V</span><b>Verify User</b></div>
        </div>

        <div className="verify-token-box">
          <label>ประวัติเบอร์ที่เคยโหลด
            <select id="verifyTokenHistory" value={selectedTel} onChange={e => onHistorySelect(e.target.value)}>
              <option value="">— เลือกเบอร์ ({tokenHistory.length}) —</option>
              {tokenHistory.map(item => {
                const expText = new Date(item.exp * 1000).toLocaleDateString("th-TH");
                const env = item.env ? `[${item.env.toUpperCase()}] ` : "";
                const name = item.displayName ? ` · ${item.displayName}` : "";
                return (
                  <option key={item.tel} value={item.tel}>
                    {env}{item.tel}{name} (หมดอายุ {expText})
                  </option>
                );
              })}
            </select>
          </label>
          <label>Token จากเว็บหน้าบ้าน
            <textarea
              id="verifyFrontToken"
              ref={textareaRef}
              rows={1}
              placeholder="วาง token จากเว็บหน้าบ้านที่นี่"
              value={frontToken}
              onChange={onTokenInput}
              onFocus={autoGrow}
              onBlur={onTokenBlur}
            />
          </label>

          <div className="verify-token-actions">
            <button id="clearVerifyTokenBtn" type="button" className="secondary verify-token-btn" onClick={onClearToken}>
              เคลียร์ Token
            </button>
            <button id="loadVerifyProfileBtn" type="button" className="primary dark verify-token-btn" onClick={onLoad}>
              โหลดข้อมูลผู้ใช้
            </button>
          </div>
        </div>

        <div id="verifyProfileSummary" className="verify-profile-summary" hidden={!profile}>
          {profile
            ? `ผู้ใช้: ${profile.displayName || "ไม่มีข้อมูล"} | ชื่อเล่น: ${profile.nickname || "-"} | เบอร์: ${profile.tel || "ไม่มีข้อมูล"}`
            : null}
        </div>

        <div className="verify-overview">
          <div className="verify-group">
            <div className="verify-group-title">
              <div>
                <b>ข้อมูลหลักบนการ์ด STAR</b>
                <CountLabel id="verifyMainCount" rows={overview?.mainRows} />
              </div>

              <button id="verifySelectAllBtn" type="button" className="secondary verify-select-all-btn" onClick={onSelectAll}>
                {selectAllLabel}
              </button>
            </div>

            <div id="verifyMainList" className="verify-list">
              {(overview?.mainRows || []).map(row => (
                <VerifyRow
                  key={row.key} row={row}
                  checked={checked} onCheck={onCheck}
                  subChecked={subChecked} onSubCheck={onSubCheck}
                  kycBusy={kycBusy} onKycChange={onKycChange}
                />
              ))}
            </div>
          </div>

          <div className="verify-group">
            <div className="verify-group-title">
              <div>
                <b>ข้อมูลเตรียมไว้ ตอนใช้งาน</b>
                <CountLabel id="verifyReadyCount" rows={overview?.readyRows} />
              </div>
            </div>

            <div id="verifyReadyList" className="verify-list">
              {(overview?.readyRows || []).map(row => (
                <VerifyRow
                  key={row.key} row={row}
                  checked={checked} onCheck={onCheck}
                  subChecked={subChecked} onSubCheck={onSubCheck}
                  kycBusy={kycBusy} onKycChange={onKycChange}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="verify-actions">
          <label className="verify-rank-label">
            <input
              type="checkbox" id="verifyRankOption" value="rank" className="verify-row-check"
              checked={rankChecked} onChange={e => setRankChecked(e.target.checked)}
            />
            <span>ถอดยศ STAR</span>
          </label>

          <div className="verify-btn-group">
            <button id="verifyAddMockBtn" type="button" className="secondary verify-action-btn" onClick={onAddMock} disabled={adding}>
              ➕ เพิ่มข้อมูล
            </button>

            <button id="verifyClearSelectedBtn" type="button" className="primary dark" onClick={onClearSelected} disabled={clearing}>
              เคลียร์ข้อมูลที่เลือก
            </button>
          </div>

          <div id="verifyResult" className={result.className} hidden={result.hidden}>{result.text}</div>
        </div>
      </section>
    </section>
  );
}
