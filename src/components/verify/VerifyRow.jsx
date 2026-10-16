export default function VerifyRow({ row, checked, onCheck, subChecked, onSubCheck, kycBusy, onKycChange }) {
  const hasData = row.values && row.values.length > 0;
  const statusClass = hasData ? "has-data" : "is-empty";

  return (
    <div className={`verify-row ${statusClass}`}>
      <div className="verify-row-icon">{row.icon}</div>

      <div>
        <div className="verify-row-title">{row.title}</div>
        <div className="verify-tags">
          {hasData
            ? row.values.map((value, i) => <span className="verify-tag" key={i}>{value}</span>)
            : <span className="verify-empty">ไม่มีข้อมูล</span>}
        </div>
        {row.subItems ? (
          <div className="verify-sub-list">
            {row.subItems.map(sub => (
              <label key={sub.key} className={`verify-sub-item ${sub.ready ? "" : "is-pending"}`}>
                <input
                  className="verify-sub-check"
                  type="checkbox"
                  data-parent={row.key}
                  value={sub.key}
                  disabled={!sub.ready}
                  checked={subChecked.has(sub.key)}
                  onChange={e => onSubCheck(row.key, sub.key, e.target.checked)}
                />
                {sub.label}{sub.ready ? "" : " (รอ API)"}
              </label>
            ))}
          </div>
        ) : null}
      </div>

      {row.isSelect ? (
        <select
          className="verify-kyc-select"
          data-key={row.key}
          key={row.currentStatus}
          defaultValue={row.currentStatus}
          disabled={kycBusy}
          onChange={e => onKycChange(e.target.value)}
        >
          <option value="none">none (ยังไม่เคยส่ง)</option>
          <option value="waiting_approve">waiting_approve (รอตรวจ)</option>
          <option value="approved">approved (อนุมัติแล้ว)</option>
          <option value="reject">reject (ไม่ผ่าน)</option>
        </select>
      ) : (
        <input
          className="verify-row-check"
          type="checkbox"
          value={row.key}
          checked={checked.has(row.key)}
          onChange={e => onCheck(row.key, e.target.checked)}
        />
      )}
    </div>
  );
}
