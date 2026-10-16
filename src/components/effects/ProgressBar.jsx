import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ProgressContext = createContext(null);

export function useProgressBar() {
  return useContext(ProgressContext);
}

const GREEN = "linear-gradient(90deg, #059669, #34d399)";
const RED = "linear-gradient(90deg, #b62e20, #ef4444)";

export function ProgressBarProvider({ children }) {
  const [state, setState] = useState({ visible: false, scale: 0, label: "", background: "" });
  const hideTimer = useRef();

  const show = useCallback((label = "กำลังดำเนินการ...") => {
    clearTimeout(hideTimer.current);
    setState({ visible: true, scale: 0, label, background: "" });
    // Animate to 20% immediately
    requestAnimationFrame(() => {
      setState(s => ({ ...s, scale: 0.2 }));
    });
  }, []);

  const update = useCallback((percent, label) => {
    setState(s => ({ ...s, scale: percent / 100, label: label || s.label }));
  }, []);

  const done = useCallback((label = "เสร็จแล้ว! ✅") => {
    setState(s => ({ ...s, scale: 1, background: GREEN, label }));
    hideTimer.current = setTimeout(() => {
      setState({ visible: false, scale: 0, label: "", background: "" });
    }, 1800);
  }, []);

  const error = useCallback((label = "เกิดข้อผิดพลาด ❌") => {
    setState(s => ({ ...s, scale: 1, background: RED, label }));
    hideTimer.current = setTimeout(() => {
      setState({ visible: false, scale: 0, label: "", background: "" });
    }, 2500);
  }, []);

  const api = useMemo(() => ({ show, update, done, error }), [show, update, done, error]);

  return (
    <ProgressContext.Provider value={api}>
      {children}
      <div id="progress-bar-wrap" className={state.visible ? "visible" : ""}>
        <div
          id="progress-bar"
          style={{
            transform: `scaleX(${state.scale})`,
            background: state.background || undefined
          }}
        />
        <div id="progress-label">{state.label}</div>
      </div>
    </ProgressContext.Provider>
  );
}
