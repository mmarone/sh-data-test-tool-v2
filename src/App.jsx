import { useRef, useState } from "react";
import { AppProvider } from "./AppContext.jsx";
import { ToastProvider } from "./components/effects/Toast.jsx";
import { ProgressBarProvider } from "./components/effects/ProgressBar.jsx";
import ConfettiCanvas from "./components/effects/Confetti.jsx";
import { useGlobalRipple } from "./components/effects/useRipple.js";
import TopBar from "./components/TopBar.jsx";
import NavTabs from "./components/NavTabs.jsx";
import StarTab from "./components/star/StarTab.jsx";
import RewardTab from "./components/RewardTab.jsx";
import VerifyTab from "./components/verify/VerifyTab.jsx";
import IdCardTab from "./components/idcard/IdCardTab.jsx";

function Shell() {
  useGlobalRipple();
  const [activeTab, setActiveTab] = useState("star");
  const confettiRef = useRef(null);

  return (
    <>
      {/* Floating Orbs Background */}
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <TopBar />

      <NavTabs active={activeTab} onChange={setActiveTab} />

      {/* ทุก tab ถูก mount ไว้ตลอด (เหมือนเดิม) และซ่อนด้วย CSS .tab-panel */}
      <StarTab active={activeTab === "star"} launchConfetti={() => confettiRef.current?.launch()} />
      <RewardTab active={activeTab === "reward"} />
      <VerifyTab active={activeTab === "verify"} />
      <IdCardTab active={activeTab === "idcard"} />

      <ConfettiCanvas ref={confettiRef} />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <ProgressBarProvider>
          <Shell />
        </ProgressBarProvider>
      </ToastProvider>
    </AppProvider>
  );
}
