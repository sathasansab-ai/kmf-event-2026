import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

function cleanSheetId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const SPREADSHEET_ID = cleanSheetId(process.env.GOOGLE_SHEET_ID ?? "");

const DEFAULT_CONFIG = {
  zones: [
    {
      key: "A",
      name: "ถนนคนเดิน (FESTIVAL MARKET)",
      title: "ของทานเล่น, อาหารจานหลัก, เครื่องดื่ม",
      price: 3500,
      total: 30,
      booked: 0,
      categories: ["ของทานเล่น", "อาหารจานหลัก", "เครื่องดื่ม"],
    },
    {
      key: "B",
      name: "ร้านค้า / ร้าน Craft (ART & MARKET)",
      title: "งานคราฟท์, เสื้อผ้า, งานปูนปาสเตอร์, ของแต่งบ้าน",
      price: 2500,
      total: 15,
      booked: 0,
      categories: ["งานปูนปลาสเตอร์", "ร้านถ่ายภาพ", "ร้านเสื้อผ้า", "งานคราฟท์/แฮนด์เมด", "เครื่องประดับ", "ของตกแต่งบ้าน"],
    },
    {
      key: "C",
      name: "ตลาดริมน้ำ (FOOD ZONE)",
      title: "สินค้าท้องถิ่น, อาหารพื้นบ้าน, ผลไม้",
      price: 2000,
      total: 7,
      booked: 0,
      categories: ["สินค้าท้องถิ่น", "อาหารพื้นบ้าน", "ผลไม้"],
    },
    {
      key: "D",
      name: "Food Truck (CINEMA BY THE RIVER)",
      title: "รถฟู้ดทรัค อาหารและเครื่องดื่ม",
      price: 4000,
      total: 8,
      booked: 0,
      categories: ["รถ Food Truck อาหาร", "รถ Food Truck เครื่องดื่ม"],
    },
  ],
  bankInfo: {
    bankName: "กสิกรไทย (KBANK)",
    accountNumber: "123-4-56789-0",
    accountName: "บจก. โคราช มูฟวี่ เฟสติวัล",
    promptPayNumber: "08X-XXX-XXXX",
  },
  qrCode: "",
  poster: "",
  logo: "",
  mainMap: "",
  zoneMaps: {},
};

async function getSheetsClient() {
  const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!credentialsRaw || !SPREADSHEET_ID) {
    throw new Error("Missing Google Sheets credentials");
  }

  const credentials = JSON.parse(credentialsRaw);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

// ตรวจสอบและสร้างแท็บ "Config" ใน Google Sheets อัตโนมัติหากยังไม่มี
async function ensureConfigSheet(sheets: any) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const hasConfig = meta.data.sheets?.some((s: any) => s.properties?.title === "Config");

  if (!hasConfig) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: "Config" },
            },
          },
        ],
      },
    });

    // ใส่ค่าเริ่มต้นลงในแท็บ Config
    const initialRows = [
      ["Key", "Value"],
      ["zones", JSON.stringify(DEFAULT_CONFIG.zones)],
      ["bankInfo", JSON.stringify(DEFAULT_CONFIG.bankInfo)],
      ["qrCode", ""],
      ["poster", ""],
      ["logo", ""],
      ["mainMap", ""],
      ["zoneMaps", "{}"],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Config!A1:B8",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: initialRows },
    });
  }
}

// GET: อ่านค่าการตั้งค่าจาก Google Sheets (เพื่อให้ทุกเครื่องเห็นตรงกัน 100%)
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    await ensureConfigSheet(sheets);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Config!A:B",
    });

    const rows = res.data.values || [];
    const configMap: Record<string, string> = {};

    rows.forEach((row: any[]) => {
      if (row[0] && row[0] !== "Key") {
        configMap[row[0]] = row[1] || "";
      }
    });

    // ประกอบค่าที่อาจถูกแยกเก็บเป็น chunks (เช่น poster_0, poster_1, ...)
    const assembleChunks = (key: string): string => {
      if (configMap[key]) return configMap[key];
      let full = "";
      let i = 0;
      while (configMap[`${key}_${i}`] !== undefined) {
        full += configMap[`${key}_${i}`];
        i++;
      }
      return full;
    };

    let zones = DEFAULT_CONFIG.zones;
    if (configMap.zones) {
      try { zones = JSON.parse(configMap.zones); } catch (e) {}
    }

    let bankInfo = DEFAULT_CONFIG.bankInfo;
    if (configMap.bankInfo) {
      try { bankInfo = JSON.parse(configMap.bankInfo); } catch (e) {}
    }

    let zoneMaps = DEFAULT_CONFIG.zoneMaps;
    const rawZoneMaps = assembleChunks("zoneMaps");
    if (rawZoneMaps) {
      try { zoneMaps = JSON.parse(rawZoneMaps); } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      source: "google_sheets",
      config: {
        zones,
        bankInfo,
        qrCode: assembleChunks("qrCode"),
        poster: assembleChunks("poster"),
        logo: assembleChunks("logo"),
        mainMap: assembleChunks("mainMap"),
        zoneMaps,
      },
    });

  } catch (err: any) {
    console.warn("Could not read config from Google Sheets, using defaults:", err.message);
    return NextResponse.json({
      success: false,
      source: "defaults",
      error: err.message,
      config: DEFAULT_CONFIG,
    });
  }
}

// POST: บันทึกค่าการตั้งค่าลง Google Sheets โดยตรง (เชื่อมโยงทุกเครื่องทั่วโลก)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sheets = await getSheetsClient();
    await ensureConfigSheet(sheets);

    // 1. อ่านข้อมูลเดิมทั้งหมดจากชีตมาก่อน เพื่อไม่ให้การอัปเดตทับข้อมูลอื่นที่ไม่ได้ส่งมา
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Config!A:B",
    });

    const currentRows = res.data.values || [];
    const configMap: Record<string, string> = {};
    currentRows.forEach((row: any[]) => {
      if (row[0] && row[0] !== "Key") {
        configMap[row[0]] = row[1] || "";
      }
    });

    // 2. ฟังก์ชันแยก string ยาวๆ เป็น chunks (ไม่เกิน 40,000 ตัวอักษรต่อเซลล์)
    const setChunked = (key: string, val: string) => {
      // ลบ chunks เก่าออกก่อน
      delete configMap[key];
      let i = 0;
      while (configMap[`${key}_${i}`] !== undefined) {
        delete configMap[`${key}_${i}`];
        i++;
      }

      if (!val) {
        configMap[key] = "";
        return;
      }

      if (val.length <= 40000) {
        configMap[key] = val;
      } else {
        const CHUNK_SIZE = 40000;
        let chunkIndex = 0;
        for (let offset = 0; offset < val.length; offset += CHUNK_SIZE) {
          configMap[`${key}_${chunkIndex}`] = val.substring(offset, offset + CHUNK_SIZE);
          chunkIndex++;
        }
      }
    };

    // 3. ผสานข้อมูลใหม่เฉพาะที่ส่งเข้ามา
    if (body.zones !== undefined) {
      configMap["zones"] = JSON.stringify(body.zones);
    }
    if (body.bankInfo !== undefined) {
      configMap["bankInfo"] = JSON.stringify(body.bankInfo);
    }
    if (body.qrCode !== undefined) {
      setChunked("qrCode", String(body.qrCode || ""));
    }
    if (body.poster !== undefined) {
      setChunked("poster", String(body.poster || ""));
    }
    if (body.logo !== undefined) {
      setChunked("logo", String(body.logo || ""));
    }
    if (body.mainMap !== undefined) {
      setChunked("mainMap", String(body.mainMap || ""));
    }
    if (body.zoneMaps !== undefined) {
      setChunked("zoneMaps", JSON.stringify(body.zoneMaps || {}));
    }

    // 4. เขียนข้อมูลทั้งหมดกลับลงชีตอย่างเป็นระเบียบ
    const finalRows: [string, string][] = [
      ["Key", "Value"],
    ];

    for (const [k, v] of Object.entries(configMap)) {
      if (k && k !== "Key") {
        finalRows.push([k, v]);
      }
    }

    // ล้างข้อมูลเก่าก่อนเพื่อป้องกันแถวตกค้าง
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: "Config!A:B",
      });
    } catch (clearErr) {}

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Config!A1:B${finalRows.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: finalRows },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกการตั้งค่าลง Google Sheets เรียบร้อยแล้ว ข้อมูลจะเชื่อมโยงทุกเครื่องทันที!",
    });

  } catch (err: any) {
    console.error("Failed to save config to Google Sheets:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save config" },
      { status: 500 }
    );
  }
}
