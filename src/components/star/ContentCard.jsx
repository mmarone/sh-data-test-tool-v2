export default function ContentCard({ sections, onAdd, onChange, onRemove }) {
  return (
    <section className="card">
      <details className="section-details">
        <summary className="card-title section-summary">
          <div><span className="step">5</span><b>เนื้อหา</b></div>
        </summary>
        <button id="addSectionBtn" className="secondary" onClick={() => onAdd()}>+ เพิ่ม Text Section</button>
        <div id="sections">
          {sections.map(section => (
            <div className="section-row" key={section.id}>
              <select name="sectionType[]" defaultValue="text"><option value="text">text</option></select>
              <textarea
                name="sectionText[]" placeholder="รายละเอียดกิจกรรม"
                value={section.text}
                onChange={e => onChange(section.id, e.target.value)}
              />
              <button className="secondary remove-section" onClick={() => onRemove(section.id)}>ลบ</button>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
