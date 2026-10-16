function DateInput({ id, label, dates, setDate }) {
  return (
    <label>{label}
      <input id={id} type="datetime-local" value={dates[id] || ""} onChange={e => setDate(id, e.target.value)} />
    </label>
  );
}

export default function TimelineCard({ campaignStatus, campaignStatusLabel, dates, setDate, onChooseStatus }) {
  return (
    <section className="card">
      <details className="timeline-details">
        <summary className="card-title timeline-summary">
          <div><span className="step">3</span><b>ช่วงเวลา</b></div>
        </summary>

        <div className="time-layout">
          <div className="campaign-status-control">
            <span className="campaign-status-heading">สถานะกิจกรรมที่ต้องการ</span>

            <input id="campaignStatus" type="hidden" value={campaignStatus} readOnly />

            <button id="chooseCampaignStatusBtn" type="button" className="secondary" onClick={onChooseStatus}>
              <span id="campaignStatusLabel">{campaignStatusLabel}</span>
              <span aria-hidden="true">▾</span>
            </button>
          </div>
          <div className="time-row">
            <DateInput id="beginDate" label="วันที่เริ่มต้น" dates={dates} setDate={setDate} />
            <DateInput id="endDate" label="วันที่สิ้นสุด" dates={dates} setDate={setDate} />
          </div>

          <div className="time-row">
            <DateInput id="startRegisterDate" label="ลงทะเบียน เริ่มต้น" dates={dates} setDate={setDate} />
            <DateInput id="endRegisterDate" label="ลงทะเบียน สิ้นสุด" dates={dates} setDate={setDate} />
          </div>

          <div className="time-row">
            <DateInput id="startShippingDate" label="วันที่จัดส่งสินค้า" dates={dates} setDate={setDate} />
          </div>

          <div className="time-row">
            <DateInput id="startDraftDate" label="ส่งดราฟต์ เริ่มต้น" dates={dates} setDate={setDate} />
            <DateInput id="endDraftDate" label="ส่งดราฟต์ สิ้นสุด" dates={dates} setDate={setDate} />
          </div>

          <div className="time-row">
            <DateInput id="startReviewDate" label="ส่งลิงก์รีวิว เริ่มต้น" dates={dates} setDate={setDate} />
            <DateInput id="endReviewDate" label="ส่งลิงก์รีวิว สิ้นสุด" dates={dates} setDate={setDate} />
          </div>
        </div>
      </details>
    </section>
  );
}
