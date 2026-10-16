import MagneticButton from "../effects/MagneticButton.jsx";

export default function CreationPanel({
  mode, modeOptionsLabel, count, countDisabled,
  onQuickClick, onOpenModeOptions, onCreate, onCountChange, creating
}) {
  return (
    <div className="creation-panel">
      <div className="card-title">
        <div><span className="step">1</span><b>รูปแบบการสร้าง</b></div>
      </div>

      <div className="mode-toolbar">
        <label className={`mode${mode === "quick" ? " active" : ""}`}>
          <input
            type="radio" name="mode" value="quick"
            checked={mode === "quick"}
            onChange={() => {}}
            onClick={onQuickClick}
          />
          <strong>สร้างด่วน</strong>
          <span>สุ่มข้อมูล 1 กิจกรรม และ Publish</span>
        </label>

        <button id="modeOptionsBtn" type="button" className="secondary mode-options-trigger" onClick={onOpenModeOptions}>
          ตัวเลือกการสร้าง: <span id="modeOptionsLabel">{modeOptionsLabel}</span>
        </button>
      </div>

      <MagneticButton
        id="createAndPublishTopBtn" type="button" className="primary dark create-top-btn"
        onClick={onCreate} disabled={creating}
      >
        สร้างกิจกรรม
      </MagneticButton>

      <div className="inline-controls">
        <p className="creation-help-text">
          ถ้ากดสร้างหลังจากเลือกกิจกรรม จะเป็นการสุ่มข้อมูลให้ หากต้องการเพิ่มรายละเอียดกิจกรรมเอง
          ก่อนกดสร้างให้แก้ไขในข้อ 2-6
        </p>
        <label>จำนวนกิจกรรม
          <input
            id="count" type="number" min="1" max="50"
            value={count}
            disabled={countDisabled}
            onChange={e => onCountChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
