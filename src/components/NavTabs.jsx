const TABS = [
  { key: "star", icon: "★", label: "Sale Here STAR" },
  { key: "reward", icon: "🎁", label: "Reward" },
  { key: "verify", icon: "🛡️", label: "Verify User" },
  { key: "idcard", icon: "🪪", label: "Gen ID Card" }
];

export default function NavTabs({ active, onChange }) {
  return (
    <nav className="nav-tabs-container">
      <div className="nav-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${active === tab.key ? " active" : ""}`}
            data-tab={tab.key}
            onClick={() => onChange(tab.key)}
          >
            <span className="tab-icon">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
