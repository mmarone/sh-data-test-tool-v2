// ===== Gen ID Card (ใช้สำหรับทดสอบเท่านั้น) =====
(() => {
  const el = id => document.getElementById(id);
  if (!el("tab-idcard")) return; // ไม่มีแท็บนี้ในหน้า → ไม่ทำอะไร

  // หลักที่ 13 = (11 - (ผลรวม d[i] * (13 - i)) % 11) % 10
  function thaiIdCheckDigit(first12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (13 - i);
    return (11 - (sum % 11)) % 10;
  }

  function isValidThaiId(digits) {
    return /^\d{13}$/.test(digits) &&
      thaiIdCheckDigit(digits) === Number(digits[12]);
  }

  function randomThaiId() {
    // หลักแรก 1-8, ที่เหลือสุ่ม แล้วคำนวณหลักสุดท้าย
    let s = String(1 + Math.floor(Math.random() * 8));
    for (let i = 0; i < 11; i++) s += Math.floor(Math.random() * 10);
    return s + thaiIdCheckDigit(s);
  }

  // 1234567890123 → 1 2345 67890 12 3
  function formatThaiId(digits) {
    const d = digits.padEnd(13, "_");
    return `${d[0]} ${d.slice(1, 5)} ${d.slice(5, 10)} ${d.slice(10, 12)} ${d[12]}`;
  }

    let photoImg = null; // รูปที่โหลดสำเร็จแล้ว (HTMLImageElement)
      let defaultPhoto = null; // รูปตั้งต้น (ใช้เมื่อไม่ได้เลือกรูป)
  const DEFAULT_PHOTO_URL = "/images/default-avatar.jpg";

  function loadImage(src, useCors) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (useCors) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("โหลดรูปไม่สำเร็จ"));
      img.src = src;
    });
  }

  el("idcPhotoFile").addEventListener("change", async e => {
    const file = e.target.files[0];
        if (!file) {
      photoImg = null;
      el("idcPhotoHint").textContent = "ใช้รูปตั้งต้น";
      draw();
      return;
    }
    const url = URL.createObjectURL(file);   // ทำ URL ชั่วคราวจากไฟล์ในเครื่อง
    photoImg = await loadImage(url, false);
    el("idcPhotoUrl").value = "";
    el("idcPhotoHint").textContent = `ใช้รูปจากไฟล์: ${file.name}`;
    draw();
  });

  el("idcPhotoUrl").addEventListener("change", async e => {
    const url = e.target.value.trim();
        if (!url) {
      photoImg = null;
      el("idcPhotoHint").textContent = "ใช้รูปตั้งต้น";
      draw();
      return;
    }
    try {
      photoImg = await loadImage(url, true);
      el("idcPhotoFile").value = "";
      el("idcPhotoHint").textContent = "ใช้รูปจาก URL";
    } catch {
      photoImg = null;
      el("idcPhotoHint").textContent =
        "⚠️ โหลด URL นี้ไม่ได้ (เว็บต้นทางอาจไม่อนุญาต CORS) ให้ดาวน์โหลดรูปแล้วใช้วิธีอัปโหลดแทน";
    }
    draw();
  });

  // ⬇️ เพิ่มใหม่: ปุ่มกลับไปใช้รูปตั้งต้น
  el("idcResetPhotoBtn").addEventListener("click", () => {
    photoImg = null;                  // ล้างรูปที่เลือก → draw() จะใช้ defaultPhoto
    el("idcPhotoFile").value = "";    // ล้างช่องอัปโหลด
    el("idcPhotoUrl").value = "";     // ล้างช่อง URL
    el("idcPhotoHint").textContent = "ใช้รูปตั้งต้น";
    draw();
  });
  // ⬆️ จบส่วนที่เพิ่ม


    const canvas = el("idcCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const FONT = `"Sarabun", "Noto Sans Thai", Tahoma, sans-serif`;

  function draw() {
    const digits = el("idcNumber").value.replace(/\D/g, "").slice(0, 13);
    const firstTh = el("idcFirstTh").value.trim() || "ชื่อ";
    const lastTh  = el("idcLastTh").value.trim()  || "นามสกุล";
    const firstEn = el("idcFirstEn").value.trim() || "First";
    const lastEn  = el("idcLastEn").value.trim()  || "Last";

    // พื้นหลัง
    ctx.fillStyle = "#eef3fb";
    ctx.fillRect(0, 0, W, H);

    // แถบหัว (บอกชัดว่าเป็นของทดสอบ)
    ctx.fillStyle = "#c62828";
    ctx.fillRect(0, 0, W, 90);
    ctx.fillStyle = "#fff";
    ctx.font = `bold 40px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText("TEST ONLY · บัตรทดสอบ ไม่ใช่เอกสารจริง", 36, 46);

    // เลขบัตร
    ctx.fillStyle = "#555";
    ctx.font = `26px ${FONT}`;
    ctx.fillText("เลขประจำตัว / ID No.", 36, 140);
    ctx.fillStyle = "#111";
    ctx.font = `bold 52px ${FONT}`;
    ctx.fillText(formatThaiId(digits), 36, 195);

    // ชื่อ
    const label = (t, y) => { ctx.fillStyle = "#555"; ctx.font = `26px ${FONT}`; ctx.fillText(t, 36, y); };
    const value = (t, y) => { ctx.fillStyle = "#111"; ctx.font = `bold 44px ${FONT}`; ctx.fillText(t, 36, y); };

    label("ชื่อ-นามสกุล", 270);   value(`${firstTh} ${lastTh}`, 318);
    label("Name",        390);   value(`${firstEn} ${lastEn}`, 438);

    // กรอบรูป (ขวา)
    const px = W - 300, py = 130, pw = 260, ph = 330;
    ctx.fillStyle = "#d5dce8";
    ctx.fillRect(px, py, pw, ph);
        const photo = photoImg || defaultPhoto; // ไม่มีรูปที่เลือก → ใช้รูปตั้งต้น
    if (photo) {
      drawCover(photo, px, py, pw, ph);
      if (!photoImg) drawNameOnPhoto(el("idcFirstTh").value.trim(), px, py, pw, ph);
    } else {
      ctx.fillStyle = "#888";
      ctx.font = `24px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("ไม่มีรูป", px + pw / 2, py + ph / 2);
      ctx.textAlign = "left";
    }

    // ลายน้ำคาดทั้งใบ
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.35);
    ctx.fillStyle = "rgba(198, 40, 40, 0.16)";
    ctx.font = `bold 120px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("SPECIMEN · TEST", 0, 0);
    ctx.restore();

    // ท้ายบัตร
    ctx.fillStyle = "#777";
    ctx.font = `22px ${FONT}`;
    ctx.fillText(`Generated by Sale Here STAR data tool · ${new Date().toLocaleDateString("th-TH")}`, 36, H - 36);

    // บอกสถานะเลขบัตร
    const hint = el("idcNumberHint");
    if (!digits.length)          hint.textContent = "";
    else if (digits.length < 13) hint.textContent = `ยังไม่ครบ (${digits.length}/13)`;
    else hint.textContent = isValidThaiId(digits) ? "✅ checksum ถูกต้อง" : "⚠️ checksum ไม่ถูก (ระบบ KYC อาจไม่รับ)";
  }

  // ครอปรูปแบบ object-fit: cover ให้เต็มกรอบโดยไม่บิดสัดส่วน
  function drawCover(img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

    el("idcRandomBtn").addEventListener("click", () => {
    el("idcNumber").value = formatThaiId(randomThaiId()).replace(/ /g, "-");
    draw();
  });

    // วางชื่อตัวใหญ่สีแดงกลางรูป (ย่อขนาดอัตโนมัติให้พอดีกรอบ)
  function drawNameOnPhoto(text, x, y, w, h) {
    if (!text) return; // ช่องชื่อว่าง → ไม่วาด

    const maxWidth = w - 24; // เว้นขอบซ้ายขวาข้างละ 12px
    let size = 96;           // เริ่มที่ตัวใหญ่สุด

    ctx.save();
    ctx.font = `900 ${size}px ${FONT}`;
    // ชื่อยาวเกินกรอบ → ลดขนาดลงทีละ 4px จนพอดี (ไม่ต่ำกว่า 28px)
    while (ctx.measureText(text).width > maxWidth && size > 28) {
      size -= 4;
      ctx.font = `900 ${size}px ${FONT}`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = x + w / 2, cy = y + h / 2;

    // ขอบสีขาวรอบตัวอักษร ช่วยให้อ่านชัดบนพื้นเทา/ขาว
    ctx.lineWidth = Math.max(4, size / 8);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";
    ctx.strokeText(text, cx, cy, maxWidth);

    // ตัวอักษรสีแดง
    ctx.fillStyle = "#d50000";
    ctx.fillText(text, cx, cy, maxWidth);

    ctx.restore();
  }

  ["idcNumber", "idcFirstTh", "idcLastTh", "idcFirstEn", "idcLastEn"].forEach(id =>
    el(id).addEventListener("input", draw)
  );

    function fileBaseName() {
    const digits = el("idcNumber").value.replace(/\D/g, "") || "nonumber";
    return `test-idcard-${digits}`;
  }

  el("idcPngBtn").addEventListener("click", () => {
    draw();
    canvas.toBlob(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileBaseName()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  });

  el("idcPdfBtn").addEventListener("click", () => {
    draw();
    const { jsPDF } = window.jspdf;
    // ขนาดหน้า = ขนาดบัตรจริง 85.6 x 54 มม.
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 54] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 85.6, 54);
    pdf.save(`${fileBaseName()}.pdf`);
  });

    draw(); // วาดครั้งแรกทันที (ตอนนี้รูปตั้งต้นอาจยังโหลดไม่เสร็จ)

  // โหลดรูปตั้งต้น เสร็จแล้ววาดใหม่อีกรอบ
  loadImage(DEFAULT_PHOTO_URL, false)
    .then(img => {
      defaultPhoto = img;
      draw();
    })
    .catch(() => console.warn("โหลดรูปตั้งต้นไม่สำเร็จ:", DEFAULT_PHOTO_URL));
})();