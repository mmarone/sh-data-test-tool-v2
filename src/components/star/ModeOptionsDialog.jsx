import Dialog from "../Dialog.jsx";
import { MODE_OPTIONS } from "../../data/mockPools.js";

export default function ModeOptionsDialog({ open, mode, onSelect, onClose }) {
  return (
    <Dialog id="modeOptionsDialog" className="status-dialog" open={open} onClose={onClose}>
      <div className="status-dialog-content">
        <h2>ตัวเลือกการสร้าง</h2>

        <div className="mode-grid mode-dialog-grid">
          {MODE_OPTIONS.map(opt => (
            <label key={opt.value} className={`mode${mode === opt.value ? " active" : ""}`}>
              <input
                type="radio" name="mode" value={opt.value}
                checked={mode === opt.value}
                onChange={() => {}}
                onClick={() => onSelect(opt.value, opt.label)}
              />
              <strong>{opt.label}</strong>
              <span>{opt.desc}</span>
            </label>
          ))}
        </div>

        <div className="status-dialog-actions">
          <button id="closeModeOptionsBtn" type="button" className="secondary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </Dialog>
  );
}
