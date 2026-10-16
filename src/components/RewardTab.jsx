export default function RewardTab({ active }) {
  return (
    <section className={`container tab-panel${active ? " active" : ""}`} id="tab-reward">
      <div className="card coming-soon-card">
        <div className="coming-soon-icon">🎁</div>
        <h2>Reward</h2>
        <p className="coming-soon-badge">เร็วๆ นี้</p>
        <p className="coming-soon-desc">ระบบจัดการและตั้งค่า Reward กำลังอยู่ในระหว่างการพัฒนา</p>
      </div>
    </section>
  );
}
