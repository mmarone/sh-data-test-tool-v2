import Dialog from "../Dialog.jsx";
import { CAMPAIGN_STATUS_OPTIONS } from "../../data/mockPools.js";

export default function CampaignStatusDialog({ open, choice, onChoiceChange, onApply, onClose }) {
  return (
    <Dialog id="campaignStatusDialog" className="status-dialog" open={open} onClose={onClose}>
      <div className="status-dialog-content">
        <h2>เลือกสถานะกิจกรรม</h2>

        <div className="status-options">
          {CAMPAIGN_STATUS_OPTIONS.map(opt => (
            <label key={opt.value || "custom"} className="status-option">
              <input
                type="radio" name="campaignStatusOption" value={opt.value}
                checked={choice === opt.value}
                onChange={() => onChoiceChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        <div className="status-dialog-actions">
          <button id="closeCampaignStatusBtn" type="button" className="secondary" onClick={onClose}>
            ปิด
          </button>
          <button id="applyCampaignStatusBtn" type="button" className="primary" onClick={onApply}>
            เลือกสถานะ
          </button>
        </div>
      </div>
    </Dialog>
  );
}
