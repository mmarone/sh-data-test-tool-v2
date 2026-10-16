import { useEffect, useMemo, useState } from "react";
import { inspectToken } from "../../lib/token.js";

export default function AuthPanel({ environment, onEnvironmentChange, token, onTokenChange }) {
  const [visible, setVisible] = useState(false);
  const [decoded, setDecoded] = useState("ไม่มีข้อมูล");

  // inspectToken: อัปเดต #tokenDecoded เฉพาะเมื่อ token ถูกต้อง (เหมือนเดิม)
  const info = useMemo(() => inspectToken(token), [token]);

  useEffect(() => {
    if (info.payload) setDecoded(JSON.stringify(info.payload, null, 2));
  }, [info]);

  return (
    <div className="endpoint-stack">
      <div className="card-title">
        <div><span className="step">0</span><b>API Authorization</b></div>
      </div>
      <div className="endpoint-field">
        <span>Environment</span>
        <div className="endpoint-options">
          <label className="check">
            <input
              type="radio" name="apiEnvironment" value="sit"
              checked={environment === "sit"}
              onChange={() => onEnvironmentChange("sit")}
            />
            SIT
          </label>
          <label className="check">
            <input
              type="radio" name="apiEnvironment" value="uat"
              checked={environment === "uat"}
              onChange={() => onEnvironmentChange("uat")}
            />
            UAT
          </label>
        </div>
      </div>

      <label>Token
        <div className="input-action">
          <input
            id="token"
            type={visible ? "text" : "password"}
            placeholder="วาง access token (eyJ...) ที่นี่"
            autoComplete="off"
            value={token}
            onChange={e => onTokenChange(e.target.value)}
          />
          <button id="toggleTokenBtn" type="button" className="secondary" onClick={() => setVisible(v => !v)}>
            {visible ? "ซ่อน" : "แสดง"}
          </button>
        </div>
        <div id="tokenInfo" className={info.className}>{info.text}</div>
        <details style={{ marginTop: 6, fontSize: 12 }}>
          <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
            🔍 ดูรายละเอียด Token (Decoded Claims)
          </summary>
          <pre id="tokenDecoded" style={{ marginTop: 6, padding: 8, maxHeight: 160, fontSize: 11 }}>{decoded}</pre>
        </details>
      </label>
    </div>
  );
}
