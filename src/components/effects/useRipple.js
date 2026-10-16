import { useEffect } from "react";

// Ripple Effect ทุกปุ่ม — ผูกครั้งเดียวที่ document
export function useGlobalRipple() {
  useEffect(() => {
    const handler = (e) => {
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
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
}
