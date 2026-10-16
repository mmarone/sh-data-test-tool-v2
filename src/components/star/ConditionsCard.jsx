export default function ConditionsCard({ form, setField }) {
  return (
    <section className="card">
      <details className="section-details">
        <summary className="card-title section-summary">
          <div><span className="step">4</span><b>เงื่อนไข</b></div>
        </summary>
        <div className="grid two">
          <label>จำนวนสิทธิ์ผู้ลงทะเบียน
            <input id="maxRegister" type="number" min="0" value={form.maxRegister} onChange={e => setField("maxRegister", e.target.value)} />
          </label>
          <label>จำนวนสิทธิ์ผู้รับกล่อง
            <input id="maxQuota" type="number" min="0" value={form.maxQuota} onChange={e => setField("maxQuota", e.target.value)} />
          </label>
        </div>
      </details>
    </section>
  );
}
