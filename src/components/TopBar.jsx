import { useEffect, useRef } from "react";
import { useApp } from "../AppContext.jsx";

export default function TopBar() {
  const { apiOnline, environment, setToken, setApiOnline, log } = useApp();
  const statusRef = useRef(null);
  const prevOnline = useRef(apiOnline);

  // Flash animation เมื่อสถานะเปลี่ยน (ไม่เล่นตอนโหลดครั้งแรก)
  useEffect(() => {
    if (prevOnline.current === apiOnline) return;
    prevOnline.current = apiOnline;
    const el = statusRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetHeight; // force reflow
    el.style.animation = "status-flip 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both";
  }, [apiOnline]);

  const clearToken = () => {
    setToken(environment, "");
    setApiOnline(false);
    log("ล้าง Token ของ environment ที่เลือกเรียบร้อยแล้ว", "ok");
  };

  return (
    <header className="topbar">
      <div className="brand"><span className="logo">★</span><span>Sale Here STAR</span><small>Test Data Tool</small></div>
      <div className="top-actions">
        <span id="apiStatus" ref={statusRef} className={`status ${apiOnline ? "online" : "offline"}`}>
          {apiOnline ? "✅ API: Connected" : "🔴 API: Not connected"}
        </span>
        <button id="clearTokenBtn" className="ghost" onClick={clearToken}>ล้าง Token</button>
      </div>
    </header>
  );
}
