import { useEffect, useState } from "react";

// พิมพ์ข้อความทีละตัวพร้อม cursor กะพริบ (ซ่อน cursor หลังพิมพ์เสร็จ 2 วินาที)
export default function Typewriter({ text, speed = 55, as: Tag = "h1" }) {
  const [shown, setShown] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    setShown(0);
    setCursor(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(i);
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setCursor(false), 2000);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <Tag style={{ opacity: 1 }}>
      {text.slice(0, shown)}
      {cursor && (
        <span
          style={{
            display: "inline-block",
            width: 2, height: "1em",
            background: "#b62e20",
            marginLeft: 3,
            verticalAlign: "middle",
            animation: "cursor-blink 0.8s step-end infinite"
          }}
        />
      )}
    </Tag>
  );
}
