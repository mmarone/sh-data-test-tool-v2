export default function PreviewCard({ payloadPreview, onBuildPreview }) {
  return (
    <section className="card preview-card">
      <details className="section-details">
        <summary className="card-title section-summary">
          <div><span className="step">6</span><b>Preview Payload</b></div>
        </summary>

        <div className="preview-actions">
          <button id="buildPayloadBtn" className="secondary" onClick={onBuildPreview}>สร้าง Preview</button>
        </div>

        <pre id="payloadPreview">{payloadPreview}</pre>
      </details>
    </section>
  );
}
