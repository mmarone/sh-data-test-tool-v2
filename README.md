# Sale Here STAR Data Tool

เครื่องมือสร้าง/ปรับข้อมูลทดสอบของ Sale Here STAR ผ่าน GraphQL
(สร้างกิจกรรม Bulk/Random/Boundary, Verify User mock data, Gen ID Card ทดสอบ)

เวอร์ชันนี้เป็น **React + Vite** และ build ออกมาเป็น **static website ล้วน**
ไม่มี server / proxy — browser ยิง GraphQL ตรงไปยัง API ของ SIT / UAT

## โครงสร้าง

```
index.html              entry ของ Vite
src/
  main.jsx              mount React
  App.jsx               shell: topbar, nav tabs, 4 tab, toast/progress/confetti
  AppContext.jsx        state กลาง: environment, admin token, API status, API log, gql()
  styles.css            CSS เดิมทั้งหมด (คัดลอกมาไม่แก้ + keyframe cursor-blink)
  lib/
    graphql.js          adminGql / frontGql ยิงตรงไป API (แทน server.js เดิม)
    queries.js          query / mutation ทั้งหมด
    campaign.js         logic สร้างกิจกรรม (timeline, buildVariants, createOne)
    verify.js           mock data handlers + สรุปข้อมูลการ์ด STAR
    token.js, utils.js, history.js, thaiId.js
  data/
    categories.js       DEFAULT_CATEGORIES
    mockPools.js        คลังค่าคงที่/ข้อมูลสุ่ม
  components/
    star/               tab "Sale Here STAR" (ฟอร์ม, dialog, history, log)
    verify/             tab "Verify User"
    idcard/             tab "Gen ID Card"
    effects/            toast, progress bar, confetti, typewriter, ripple, magnetic button
legacy/                 โค้ดเวอร์ชันเดิม (vanilla JS + Node proxy) เก็บไว้อ้างอิง ลบได้
```

## พัฒนา

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build + Deploy

```bash
npm run build      # ได้โฟลเดอร์ dist/
npm run preview    # ลองเปิด dist/ ในเครื่อง
```

`dist/` เป็นไฟล์ static ทั้งหมด (`index.html` + `assets/`) และใช้ relative path (`base: "./"`)
จึงวางได้ทั้ง root domain และ sub-path โดยไม่ต้องแก้ config เช่น

- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, publish directory `dist`
- **GitHub Pages**: push เนื้อหาใน `dist/` ขึ้น branch `gh-pages` (หรือใช้ action ที่ deploy โฟลเดอร์ `dist`)
- **S3 / GCS / Nginx**: อัปโหลดเนื้อหาใน `dist/` ไปวางที่ bucket / document root

ไม่ต้องตั้ง rewrite rule เพราะแอปไม่ใช้ client-side routing (เป็นหน้าเดียว สลับ tab ด้วย state)

## GraphQL endpoint

ค่า default อยู่ใน `src/lib/graphql.js`

| environment | Admin (Back Office)                              | Front (เว็บหน้าบ้าน)                        |
|-------------|--------------------------------------------------|---------------------------------------------|
| sit         | https://sit-api-admin.sh-pxmer.co/graphql        | https://sit-api.sh-pxmer.co/graphql         |
| uat         | https://uat-api-admin.sh-pxmer.co/graphql        | https://uat-api.sh-pxmer.co/graphql         |

override ตอน build ได้ด้วยตัวแปรใน `.env` (ดู `.env.example`):
`VITE_ADMIN_GQL_SIT`, `VITE_ADMIN_GQL_UAT`, `VITE_FRONT_GQL_SIT`, `VITE_FRONT_GQL_UAT`

### หมายเหตุเรื่อง CORS

API ทั้งสองชุดตอบ `Access-Control-Allow-Origin` ตาม origin ที่เรียก และอนุญาต header
`authorization, content-type, skiprefresh, platform` จึงยิงจาก static site บน domain ใดก็ได้
หากภายหลัง API เปลี่ยนนโยบาย CORS จะต้องมี proxy อีกครั้ง (ดู `legacy/server.js` เป็นตัวอย่าง)

header `origin` / `referer` / `cookie` ที่ proxy เดิมเคยแนบให้ browser ตั้งเองไม่ได้
และจากการทดสอบไม่จำเป็นต่อการเรียก API

## ข้อมูลที่เก็บใน browser (localStorage)

- `starAdminToken:sit`, `starAdminToken:uat` — admin token แยกตาม environment
- `starHistory` — กิจกรรมที่สร้างจากเครื่องมือนี้
- `starVerifyFrontToken`, `starVerifyTokenHistory` — token หน้าบ้านและประวัติแยกตามเบอร์
