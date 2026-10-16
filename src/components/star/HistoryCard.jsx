import { useEffect, useRef, useState } from "react";
import { campaignStatusText } from "../../lib/campaign.js";

export default function HistoryCard({
  history, environment, flashSignal,
  onDeleteSelected, onMarkDeleted, onChangeStatus, onClearHistory
}) {
  const [selected, setSelected] = useState(() => new Set());
  const containerRef = useRef(null);

  const visibleItems = history
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.environment === environment);

  // render ใหม่ทุกครั้ง = checkbox ถูก reset (เหมือน renderHistory เดิม)
  useEffect(() => {
    setSelected(new Set());
  }, [history, environment]);

  // Flash row ใหม่ใน history
  useEffect(() => {
    if (!flashSignal) return;
    requestAnimationFrame(() => {
      const firstRow = containerRef.current?.querySelector(".history-row");
      if (!firstRow) return;
      firstRow.classList.remove("flash-new");
      void firstRow.offsetWidth; // force reflow
      firstRow.classList.add("flash-new");
      firstRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [flashSignal]);

  const selectableIndexes = visibleItems
    .filter(({ item }) => item.status === "success" && item.id)
    .map(({ index }) => index);

  const allSelected = selectableIndexes.length > 0 && selectableIndexes.every(i => selected.has(i));

  const toggleAll = (checked) => {
    setSelected(checked ? new Set(selectableIndexes) : new Set());
  };

  const toggleOne = (index, checked) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) next.add(index); else next.delete(index);
      return next;
    });
  };

  return (
    <section className="card">
      <div className="card-title">
        <div><b>กิจกรรมที่สร้างจากเครื่องมือนี้</b></div>
        <div className="history-tools">
          <label className="check">
            <input
              id="selectAllHistory" type="checkbox"
              checked={allSelected}
              onChange={e => toggleAll(e.target.checked)}
            />
            เลือกทั้งหมด
          </label>
          <button id="deleteSelectedHistoryBtn" className="primary dark" onClick={() => onDeleteSelected([...selected])}>ลบที่เลือก</button>
          <button id="clearHistoryBtn" className="secondary" onClick={onClearHistory}>ล้าง History</button>
        </div>
      </div>
      <div id="history" ref={containerRef}>
        {visibleItems.length ? visibleItems.map(({ item, index }) => {
          const canDelete = item.status === "success" && item.id;
          return (
            <div className="history-row" key={`${item.createdAt}-${index}`}>
              <input
                className="history-select"
                type="checkbox"
                data-index={index}
                aria-label={`เลือกกิจกรรม ID ${item.id || "-"}`}
                disabled={!canDelete}
                checked={selected.has(index)}
                onChange={e => toggleOne(index, e.target.checked)}
              />
              <div>
                <b>{item.title}</b>
                <div className="hint">
                  ID: {item.id || "-"} · slug: {item.seoSlugUrl || ""}
                </div>
              </div>
              <span className={`badge ${item.status === "success" ? "ok" : "fail"}`}>
                {item.status === "success" ? "SUCCESS" : "FAILED"}
              </span>
              <span className="history-campaign-status">{campaignStatusText(item.campaignStatus)}</span>
              {canDelete ? (
                <div className="history-actions">
                  <button className="secondary change-status-btn" data-index={index} onClick={() => onChangeStatus(index)}>🔄 เปลี่ยนสถานะ</button>
                  <button className="secondary mark-deleted" data-index={index} onClick={() => onMarkDeleted(index)}>
                    {item.deletedInBackOffice ? "ลบแล้ว ✓" : "ลบแล้วใน Back Office"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        }) : (
          <div className="hint">ยังไม่มีรายการใน {environment.toUpperCase()}</div>
        )}
      </div>
    </section>
  );
}
