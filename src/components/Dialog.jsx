import { useEffect, useRef } from "react";

/**
 * <dialog> แบบ controlled: open=true → showModal(), open=false → close()
 * กด Esc (native close) จะเรียก onClose ให้ state ตรงกับ DOM
 */
export default function Dialog({ open, onClose, className, id, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => { if (open) onClose?.(); };
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [open, onClose]);

  return (
    <dialog id={id} ref={ref} className={className}>
      {children}
    </dialog>
  );
}
