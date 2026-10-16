import { forwardRef, useImperativeHandle, useRef } from "react";

// สี confetti ตาม brand
const COLORS = [
  "#b62e20", "#d74632", "#ff6b4a",
  "#fbbf24", "#34d399", "#60a5fa",
  "#fff", "#f9a8d4", "#a78bfa"
];

export function launchConfettiOn(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: 6 + Math.random() * 8,
    h: 4 + Math.random() * 6,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 5,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1
  }));

  let frame;
  let startTime = null;
  const DURATION = 3000;

  function animate(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      p.vy *= 1.01;
      p.opacity = Math.max(0, 1 - elapsed / DURATION * 1.5);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (elapsed < DURATION) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  }

  frame = requestAnimationFrame(animate);
}

const ConfettiCanvas = forwardRef(function ConfettiCanvas(_, ref) {
  const canvasRef = useRef(null);
  useImperativeHandle(ref, () => ({ launch: () => launchConfettiOn(canvasRef.current) }), []);
  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        zIndex: 9998, width: "100%", height: "100%"
      }}
    />
  );
});

export default ConfettiCanvas;
