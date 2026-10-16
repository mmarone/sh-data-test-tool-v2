export default function LogCard({ logs, onClear }) {
  return (
    <section className="card log-card">
      <div className="card-title">
        <div><b>API Log</b></div><button id="clearLogBtn" className="secondary" onClick={onClear}>Clear</button>
      </div>
      <div id="log">
        {logs.map(row => (
          <div
            key={row.id}
            className={`log ${row.type}`}
            style={{ animation: "log-slide-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <span className="log-icon">{row.icon}</span>
            <span className="log-time">[{row.time}]</span>
            <span className="log-msg">{row.msg}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
