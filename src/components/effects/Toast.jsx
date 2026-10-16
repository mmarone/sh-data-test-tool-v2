import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

function ToastItem({ toast, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const timerRef = useRef();

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setRemoving(true);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, toast.duration);
    return () => clearTimeout(timerRef.current);
  }, [dismiss, toast.duration]);

  const style = {
    "--dur": `${toast.duration}ms`,
    "--toast-dur": `${toast.duration}ms`,
    "--timer-dur": `${toast.duration}ms`
  };

  return (
    <div
      className={`toast ${toast.type}${removing ? " removing" : ""}`}
      style={style}
      onClick={dismiss}
      onAnimationEnd={e => {
        if (removing && e.target === e.currentTarget) onRemove(toast.id);
      }}
    >
      <span className="toast-icon">{ICONS[toast.type] || "💬"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

let toastSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    setToasts(list => [...list, { id: ++toastSeq, message, type, duration }]);
  }, []);

  const remove = useCallback(id => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast-container" aria-live="polite">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}
