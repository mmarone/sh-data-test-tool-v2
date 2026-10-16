// ==========================================
// ค่าคงที่ / คลังข้อมูลสุ่ม (ย้ายจาก app.js เดิม)
// ==========================================

export const COVER_IMAGE_URLS = [
  "https://dummyimage.com/1200x800/2c3e50/ffffff",
  "https://dummyimage.com/1200x800/3498db/ffffff",
  "https://dummyimage.com/1200x800/2ecc71/ffffff",
  "https://dummyimage.com/1200x800/e74c3c/ffffff",
  "https://dummyimage.com/1200x800/9b59b6/ffffff",
  "https://dummyimage.com/1200x800/e67e22/ffffff",
  "https://dummyimage.com/1200x800/333/fff&text=Test+Image+01",
  "https://dummyimage.com/1200x800/27ae60/fff&text=SUCCESS",
  "https://dummyimage.com/1200x800/c0392b/fff&text=ERROR",
  "https://dummyimage.com/1200x800/16a085/fff&text=Banner+1200x800",
  "https://dummyimage.com/1200x800/8e44ad/fff&text=Product+Sample"
];

export const DEFAULT_SECTION_TEXTS = [
  "รายละเอียดกิจกรรมตัวอย่างสำหรับทดสอบ",
  "ข้อความตัวอย่างสำหรับทดสอบเนื้อหากิจกรรม",
  "ตัวอย่างเงื่อนไขและรายละเอียดกิจกรรมสำหรับทดสอบ"
];

// รายการสายที่ใช่ทั้งหมด (จาก API categoriesV2)
export const ALL_CATEGORIES = [
  { id: 2275, name: "ความงามและสุขภาพ" },
  { id: 2277, name: "แฟชั่นและช้อปปิ้ง" },
  { id: 2278, name: "อาหารและเครื่องดื่ม" },
  { id: 2279, name: "การเดินทางและขนส่ง" },
  { id: 2280, name: "ท่องเที่ยว" },
  { id: 2300, name: "สัตว์เลี้ยง" },
  { id: 2301, name: "แม่และเด็ก" },
  { id: 2302, name: "บ้านและสวน" },
  { id: 2303, name: "เทคโนโลยี" },
  { id: 2304, name: "อีเวนต์และกิจกรรม" },
  { id: 2305, name: "กีฬา" },
  { id: 2306, name: "การศึกษา" },
  { id: 2309, name: "สายคาเฟ่ห้ามพลาด" }
];

// รายการจังหวัดทั้งหมด (จาก API getProvinces)
export const ALL_PROVINCES = [
  "กระบี่","กรุงเทพมหานคร","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี",
  "ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด",
  "ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี",
  "นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี",
  "พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์",
  "แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง",
  "ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล",
  "สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย",
  "สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ",
  "อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"
];

// วันเวลาว่างรับงาน (ลำดับนี้ = ลำดับที่แสดงบนเว็บ)
export const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const ALL_TIME_SLOTS = ["slot_09_12", "slot_12_14", "slot_14_17", "slot_17_late"];

// หัวข้อย่อยของ "เกี่ยวกับคุณ"  (ready: false = ยังไม่มี API ทำปุ่มไว้ก่อน)
export const ABOUT_SUB_ITEMS = [
  { key: "creatorAvatar",   label: "รูปโปรไฟล์ครีเอเตอร์", ready: false },
  { key: "caption",         label: "แนะนำตัว",            ready: true  },
  { key: "profileImages",   label: "รูปของคุณ",           ready: true  },
  { key: "portfolioImages", label: "รูปผลงาน",            ready: true  },
  { key: "portfolioVideos", label: "วิดีโอผลงาน",          ready: true  },
  { key: "nickname",        label: "ชื่อเล่น",             ready: true  }
];

// คลังรูป (จากไฟล์ API ที่แนบ + รูปเดิมที่ใช้อยู่)
export const MOCK_IMAGE_POOL = [
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator0jpeg-xgabi4tbdlpf.jpg",
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator1jpeg-gk26kqo4et6p.jpg",
  "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/14/chatgptimage302569152922-h8nvpcsp3om0.jpg"
];

// คลังวิดีโอ (วิดีโอ + thumbnail ต้องเป็นคู่กัน)
export const MOCK_VIDEO_POOL = [
  {
    videoPath: "https://media.salehere.co.th/uat-videos/2026/10/15/s3uploads3uploadimg0482-3b6lk1hq1dly.mp4",
    thumbnail: "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/15/profilecreator0jpeg-fckotun5qqwe.jpg"
  },
  {
    videoPath: "https://media.salehere.co.th/uat-videos/2026/10/14/magicalfestivalcelebration-njhcklm8oe1t.mp4",
    thumbnail: "https://img-v2.salehere.co.th/p-uat/1200x0/2026/10/14/thumb1-piw0iu4ysvtt.jpg"
  }
];

// คลังชื่อเล่น (ผลไม้ + สัตว์)
export const MOCK_NICKNAME_POOL = [
  // ผลไม้
  "ส้ม", "กล้วย", "มะม่วง", "แตงโม", "สตรอว์เบอร์รี", "องุ่น", "มะนาว", "ลำไย", "มังคุด", "เงาะ",
  // สัตว์
  "ไก่", "เป็ด", "หมู", "แมว", "หมา", "กระต่าย", "หมี", "ปลาทอง", "นกฮูก", "เพนกวิน"
];

export const CAMPAIGN_STATUS_OPTIONS = [
  { value: "", label: "กำหนดเวลาเอง" },
  { value: "beforeRegister", label: "ยังไม่เปิดลงทะเบียน" },
  { value: "registering", label: "เปิดลงทะเบียน" },
  { value: "registrationClosed", label: "หมดเวลาลงทะเบียน" },
  { value: "draft", label: "ถึงเวลาส่งดราฟต์" },
  { value: "review", label: "ถึงเวลาส่งลิงก์รีวิว" },
  { value: "ended", label: "สิ้นสุดกิจกรรม" }
];

export const MODE_OPTIONS = [
  { value: "manual", label: "Manual", desc: "กำหนดข้อมูลเอง 1 กิจกรรม" },
  { value: "bulk", label: "Bulk", desc: "สร้างหลายกิจกรรมจาก Template เดียว" },
  { value: "random", label: "Random Unique", desc: "สุ่ม title / slug / จำนวน / วันเวลา ไม่ซ้ำ" },
  { value: "boundary", label: "Boundary / QA", desc: "สร้างชุดข้อมูลสำหรับทดสอบค่าต่ำ/สูง/พิเศษ" }
];
