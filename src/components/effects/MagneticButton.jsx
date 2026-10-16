import { useRef } from "react";

// ปุ่ม Primary หลักที่ "ดูด" ตามเมาส์ (ใช้กับปุ่มสร้างกิจกรรมเท่านั้น)
export default function MagneticButton({ children, ...props }) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
  };

  const onMouseLeave = () => {
    const btn = ref.current;
    if (!btn) return;
    btn.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
    btn.style.transform = "translate(0, 0) scale(1)";
    btn.addEventListener("transitionend", () => {
      btn.style.transition = "";
    }, { once: true });
  };

  const onMouseEnter = () => {
    if (ref.current) ref.current.style.transition = "transform 0.1s ease";
  };

  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
}
