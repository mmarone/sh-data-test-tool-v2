// ==========================================
// Verify User tab — mock data handlers, สรุปข้อมูลการ์ด, ประวัติ token
// ==========================================
import { checkGraphQLErrors } from "./graphql.js";
import { compact, formatFollower, randomChoice, randomInt, randomSubsetInOrder, readJson, shuffle } from "./utils.js";
import { decodeJwtPayload, isTokenExpired } from "./token.js";
import {
  ABOUT_SUB_ITEMS, ALL_CATEGORIES, ALL_DAYS, ALL_PROVINCES, ALL_TIME_SLOTS,
  MOCK_IMAGE_POOL, MOCK_NICKNAME_POOL, MOCK_VIDEO_POOL
} from "../data/mockPools.js";
import {
  M_ANALYZE_SOCIAL_PROFILE_INSIGHT, M_CREATE_OR_UPDATE_CREATOR, M_CREATE_SOCIAL_PROFILE,
  M_CREATE_USER_ADDRESS, M_EDIT_PROFILE_CAPTION, M_EDIT_PROFILE_NICKNAME,
  M_SET_USER_CATEGORIES, M_UPSERT_PAYOUT, Q_MY_DISPLAY_NAME
} from "./queries.js";

// สุ่ม 1-3 รูป (ซ้ำได้) เป็นรูปแบบ InputCreatorImage
function randomImageItems() {
  const count = randomInt(1, 3);
  return Array.from({ length: count }, (_, i) => ({
    image: { imgPath: randomChoice(MOCK_IMAGE_POOL) },
    seq: i + 1
  }));
}

// สุ่ม 1-3 วิดีโอ (ซ้ำได้) เป็นรูปแบบของ portfolio.videos
function randomVideoItems() {
  const count = randomInt(1, 3);
  return Array.from({ length: count }, (_, i) => {
    const v = randomChoice(MOCK_VIDEO_POOL);
    return {
      video: { videoPath: v.videoPath },
      videoThumbnail: { imgPath: v.thumbnail },
      seq: i + 1
    };
  });
}

/**
 * ตาราง Mock Data แยกตามแต่ละ Key
 * ทุก handler รับ ctx = { frontGql(query, variables), aboutSubs: string[] }
 */
export const MOCK_DATA_HANDLERS = {
  // 1. ประเภทครีเอเตอร์
  kind: {
    title: "ประเภทครีเอเตอร์",
    run: async ({ frontGql }) => {
      const creatorTypes = ["creator", "page"];
      const randomCreatorType = creatorTypes[Math.floor(Math.random() * creatorTypes.length)];
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, { creatorType: randomCreatorType });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 2. ช่องทางของฉัน + เรท
  socials: {
    title: "ช่องทางของฉัน + เรท",
    run: async ({ frontGql }) => {
      const socials = [
        { socialType: "facebook", urlPrefix: "https://www.facebook.com/facebook_", hasPhotoPrice: true },
        { socialType: "instagram", urlPrefix: "https://www.instagram.com/instagram_", hasPhotoPrice: true },
        { socialType: "tiktok", urlPrefix: "https://www.tiktok.com/@tiktok_", hasPhotoPrice: false }
      ];

      const social = socials[Math.floor(Math.random() * socials.length)];
      const timestamp = Date.now();

      const variables = {
        socialType: social.socialType,
        profileUrl: `${social.urlPrefix}${timestamp}`,
        followerCount: randomInt(1_000, 1_000_000),
        shortVdoPrice: randomInt(50, 5_000)
      };

      if (social.hasPhotoPrice) {
        variables.photoPrice = randomInt(25, 3_000);
      }

      const res = await frontGql(M_CREATE_SOCIAL_PROFILE, variables);
      checkGraphQLErrors(res.createSocialProfile);
    }
  },

  // 3. สายที่ใช่
  categories: {
    title: "สายที่ใช่",
    run: async ({ frontGql }) => {
      const count = randomInt(3, 5);
      const picked = shuffle(ALL_CATEGORIES).slice(0, count);
      console.log("สุ่มสายที่ใช่ได้:", picked.map(c => c.name).join(", "));
      const res = await frontGql(M_SET_USER_CATEGORIES, {
        categories: picked.map(c => ({ id: c.id }))
      });
      checkGraphQLErrors(res.setUserCategories);
    }
  },

  // 4. เกี่ยวกับคุณ
  about: {
    title: "เกี่ยวกับคุณ",
    run: async ({ frontGql, aboutSubs }) => {
      let subs = [...(aboutSubs || [])];

      // ไม่ได้ติ๊กข้อย่อยเลย → ทำทุกข้อที่มี API แล้ว
      if (!subs.length) {
        subs = ABOUT_SUB_ITEMS.filter(s => s.ready).map(s => s.key);
      }

      if (subs.includes("caption")) {
        const me = await frontGql(Q_MY_DISPLAY_NAME);
        const displayName = me.myProfile?.displayName || "";
        const capRes = await frontGql(M_EDIT_PROFILE_CAPTION, { caption: `สวัสดีเราชื่อ ${displayName}` });
        checkGraphQLErrors(capRes.editProfile);
      }

      const variables = {};
      const portfolio = {};

      if (subs.includes("profileImages"))   variables.profileImages = randomImageItems();
      if (subs.includes("portfolioImages")) portfolio.images = randomImageItems();
      if (subs.includes("portfolioVideos")) portfolio.videos = randomVideoItems();

      if (Object.keys(portfolio).length) variables.portfolio = portfolio;

      console.log("เกี่ยวกับคุณ → ข้อย่อย:", subs, "ข้อมูลที่ส่ง:", variables);

      if (Object.keys(variables).length) {
        const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, variables);
        checkGraphQLErrors(res.createOrUpdateCreatorProfile);
      }

      if (subs.includes("nickname")) {
        const nickname = randomChoice(MOCK_NICKNAME_POOL);
        console.log("สุ่มชื่อเล่นได้:", nickname);
        const nickRes = await frontGql(M_EDIT_PROFILE_NICKNAME, { nickname });
        checkGraphQLErrors(nickRes.editProfile);
      }

      // TODO: creatorAvatar → เพิ่มตรงนี้เมื่อได้ API
    }
  },

  // 5. พื้นที่รับงาน
  provinces: {
    title: "พื้นที่รับงาน",
    run: async ({ frontGql }) => {
      const count = randomInt(1, 3);
      const picked = shuffle(ALL_PROVINCES).slice(0, count);
      console.log("สุ่มพื้นที่รับงานได้:", picked.join(", "));
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, { preferredProvinces: picked });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 6. วันเวลาว่างรับงาน
  availability: {
    title: "วันเวลาว่างรับงาน",
    run: async ({ frontGql }) => {
      const days = randomSubsetInOrder(ALL_DAYS, 1, 7);
      const availableTimes = days.map(day => ({
        day,
        timeSlots: randomSubsetInOrder(ALL_TIME_SLOTS, 1, 4)
      }));
      console.table(availableTimes.map(d => ({ day: d.day, slots: d.timeSlots.join(", ") })));
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, { availableTimes });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 7. ช่องทางติดต่อ
  contact: {
    title: "ช่องทางติดต่อ",
    run: async ({ frontGql }) => {
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        lineId: "@koasoon90",
        showLineId: true,
        tel: "0811111190",
        showTel: true,
        website: "https://theedanai.devsh@gmail.com",
        showWebsite: true
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  },

  // 8. ข้อมูลผู้ติดตาม (Insight)
  insight: {
    title: "ข้อมูลผู้ติดตาม",
    run: async ({ frontGql }) => {
      const insightImages = [
        { type: "gender", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilegenderagepng-7yqq50aggmy2.jpg" },
        { type: "age", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilegenderagepng-6xh8vsa9cbvm.jpg" },
        { type: "location", url: "https://img.salehere.co.th/p-uat/1200x0/2026/08/27/fbmobilecity-t89wn9abqwj3.jpg" }
      ];

      for (const item of insightImages) {
        const res = await frontGql(M_ANALYZE_SOCIAL_PROFILE_INSIGHT, {
          socialType: "facebook",
          insightType: item.type,
          imageUrl: item.url
        });
        checkGraphQLErrors(res.analyzeSocialProfileInsight);
      }
    }
  },

  // 9. บัญชีรับเงิน
  payout: {
    title: "บัญชีรับเงิน",
    run: async ({ frontGql }) => {
      const res = await frontGql(M_UPSERT_PAYOUT, {
        payoutType: "juristic",
        individual: null,
        juristic: {
          juristicCertificateImage: null,
          juristicName: "บริษัท เซลเฮียร์ กรุ๊ป จำกัด",
          juristicId: "0105564133098",
          juristicAddress: "1240/16 ซอยสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร",
          officeType: "headquarters"
        },
        bankBookCopyImage: null,
        bankCode: "011",
        bankName: "ธนาคารทหารไทยธนชาต",
        accountNumber: "7609418285",
        accountName: "นาง ตัวอย่าง สมมติ",
        useSameAsDocument: false,
        taxAddress: {
          taxpayerName: "บริษัท 1111 จำกัด",
          taxpayerId: "0105564133098",
          address: "1240/16 ซอยสุขุมวิท",
          zipcode: "10250",
          subDistrict: "ประเวศ",
          district: "เขตประเวศ",
          province: "กรุงเทพมหานคร"
        },
        phone: "0811111168",
        email: "theedanai.devsh@gmai.com"
      });
      checkGraphQLErrors(res.upsertMyPayoutProfile);
    }
  },

  // 10. ที่อยู่รับของ
  address: {
    title: "ที่อยู่รับของ",
    run: async ({ frontGql }) => {
      const res = await frontGql(M_CREATE_USER_ADDRESS, {
        name: "เก้าศูนย์ ซิท",
        tel: "0811111190",
        address: "90",
        zipcode: "10900",
        subDistrict: "จตุจักร",
        district: "เขตจตุจักร",
        province: "กรุงเทพมหานคร"
      });
      checkGraphQLErrors(res.createUserAddress);
    }
  },

  // 11. สัดส่วน
  body: {
    title: "สัดส่วน",
    run: async ({ frontGql }) => {
      const res = await frontGql(M_CREATE_OR_UPDATE_CREATOR, {
        bodyMeasurement: {
          weight: { value: 59, unit: "kg" },
          height: { value: 169, unit: "cm" },
          chest: { value: 36, unit: "inch" },
          waist: { value: 29, unit: "inch" },
          hip: { value: 36, unit: "inch" },
          shoeSize: { value: 40, unit: "eur" }
        }
      });
      checkGraphQLErrors(res.createOrUpdateCreatorProfile);
    }
  }
};

// แปลงผล StarProfileOverview → แถวสำหรับแสดงบนการ์ด
export function buildVerifyRows(data) {
  const profile = data.myProfile || {};
  const creator = profile.creatorProfile || {};
  const payout = data.brandCampaignPayoutProfiles?.entities?.[0];
  const address = data.myAddress;
  const measurement = creator.bodyMeasurement || {};

  const socials = (profile.socialProfiles || []).map(social => {
    const follower = formatFollower(social.followerCount);
    return follower ? `${social.type.toUpperCase()} ${follower}` : social.type.toUpperCase();
  });

  const prices = (profile.socialProfiles || []).flatMap(social => compact([
    social.photoPrice ? `${social.type} รูป ${social.photoPrice}` : null,
    social.shortVdoPrice ? `${social.type} วิดีโอสั้น ${social.shortVdoPrice}` : null,
    social.longVdoPrice ? `${social.type} วิดีโอยาว ${social.longVdoPrice}` : null,
    social.sharingPrice ? `${social.type} แชร์ ${social.sharingPrice}` : null
  ]));

  const portfolioCount =
    (creator.profileImages || []).length +
    (creator.portfolio?.images || []).length +
    (creator.portfolio?.videos || []).length;

  const availableDays = (creator.availableTimes || [])
    .filter(day => day.timeSlots?.some(slot => slot.isSelected))
    .map(day => day.day);

  const bodyValues = compact([
    measurement.height?.value ? `${measurement.height.value} ${measurement.height.unit}` : null,
    measurement.weight?.value ? `${measurement.weight.value} ${measurement.weight.unit}` : null,
    measurement.chest?.value && measurement.waist?.value && measurement.hip?.value
      ? `${measurement.chest.value}-${measurement.waist.value}-${measurement.hip.value}`
      : null
  ]);

  const kycStatus = data.myUserVerify?.status || profile.verifyStatus || "none";
  const kycValues = kycStatus && kycStatus !== "none" ? [kycStatus] : [];

  const mainRows = [
    { key: "kind", icon: "T", title: "ประเภทครีเอเตอร์", values: compact([creator.creatorType]) },
    { key: "socials", icon: "R", title: "ช่องทางของฉัน + เรท", values: [...socials, ...prices] },
    { key: "categories", icon: "C", title: "สายที่ใช่", values: (profile.categories || []).map(item => item.name) },
    {
      key: "about", icon: "P", title: "เกี่ยวกับคุณ",
      values: compact([
        portfolioCount ? `รูป/ผลงาน ${portfolioCount}` : null,
        profile.nickname ? `ชื่อเล่น: ${profile.nickname}` : null
      ]),
      subItems: ABOUT_SUB_ITEMS
    },
    { key: "provinces", icon: "A", title: "พื้นที่รับงาน", values: creator.preferredProvinces || [] },
    { key: "availability", icon: "D", title: "วันเวลาว่างรับงาน", values: availableDays },
    { key: "contact", icon: "L", title: "ช่องทางติดต่อ", values: compact([creator.lineId, creator.tel, creator.website]) },
    {
      key: "kyc",
      icon: "K",
      title: "ยืนยันตัวตน",
      values: kycValues,
      isSelect: true,
      currentStatus: kycStatus
    }
  ];

  const readyRows = [
    {
      key: "insight",
      icon: "I",
      title: "ข้อมูลผู้ติดตาม",
      values: (data.socialProfileInsights || [])
        .filter(item => item.completed)
        .map(item => `${item.socialType} สำเร็จ`)
    },
    {
      key: "payout",
      icon: "B",
      title: "บัญชีรับเงิน",
      values: compact([payout?.payoutType, payout?.bankName, payout?.accountNumber ? `••${String(payout.accountNumber).slice(-4)}` : null])
    },
    {
      key: "address",
      icon: "H",
      title: "ที่อยู่รับของ",
      values: address ? compact([address.subDistrict, address.district, address.province, address.zipcode]) : []
    },
    {
      key: "body",
      icon: "S",
      title: "สัดส่วน",
      values: bodyValues
    }
  ];

  return { mainRows, readyRows, profile };
}

// ===== ประวัติ token หน้าบ้าน (แยกตามเบอร์) =====
export const VERIFY_TOKEN_HISTORY_KEY = "starVerifyTokenHistory";
export const VERIFY_FRONT_TOKEN_KEY = "starVerifyFrontToken";

export function getVerifyTokenHistory() {
  return readJson(VERIFY_TOKEN_HISTORY_KEY, []);
}

export function setVerifyTokenHistory(list) {
  localStorage.setItem(VERIFY_TOKEN_HISTORY_KEY, JSON.stringify(list));
}

// บันทึก/อัปเดตรายการของเบอร์นี้ (เบอร์ซ้ำ → แทนที่ของเดิม)
export function saveVerifyTokenHistory(token, profile) {
  const tel = profile?.tel;
  if (!tel) return;

  const payload = decodeJwtPayload(token) || {};
  const entry = {
    tel,
    displayName: profile.displayName || "",
    token,
    exp: payload.exp || null,
    env: payload.user?.env || "",
    savedAt: Date.now()
  };

  const others = getVerifyTokenHistory().filter(item => item.tel !== tel);
  setVerifyTokenHistory([entry, ...others]);
}

// คืนรายการที่ยังไม่หมดอายุ และเขียนกลับ storage (ตัวหมดอายุหายจริง)
export function pruneVerifyTokenHistory() {
  const alive = getVerifyTokenHistory().filter(item => !isTokenExpired(item.exp));
  setVerifyTokenHistory(alive);
  return alive;
}
