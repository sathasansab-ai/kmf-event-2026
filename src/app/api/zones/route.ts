import { NextResponse } from "next/server";
import { google } from "googleapis";

function cleanSheetId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const SPREADSHEET_ID = cleanSheetId(process.env.GOOGLE_SHEET_ID ?? "");

const DEFAULT_ZONES: Record<string, { name: string; price: number; total: number; mapDesc: string; color: string }> = {
  A: {
    name: "โซน A (ถนนคนเดิน - FESTIVAL MARKET)",
    price: 3500,
    total: 30,
    mapDesc: "พื้นที่ริมถนนคนเดินสายหลัก ใกล้เวทีกลาง มีคนเดินผ่านตลอดทั้งคืน",
    color: "bg-orange-500",
  },
  B: {
    name: "โซน B (ร้านค้า , ร้าน Craft - ART & MARKET)",
    price: 2500,
    total: 15,
    mapDesc: "พื้นที่ลานคราฟท์และต้นไม้ใหญ่ บรรยากาศอบอุ่น สไตล์วินเทจ",
    color: "bg-blue-500",
  },
  C: {
    name: "โซน C (ตลาดริมน้ำ - FOOD ZONE)",
    price: 2000,
    total: 7,
    mapDesc: "พื้นที่เลียบระเบียงริมน้ำบึงหัวทะเล เหมาะสำหรับอาหารและเครื่องดื่มชิลๆ",
    color: "bg-teal-500",
  },
  D: {
    name: "โซน D (Food Truck - CINEMA BY THE RIVER)",
    price: 4000,
    total: 8,
    mapDesc: "ลานจอดรถ Food Truck กว้างขวาง ด้านหน้าจอหนังกลางแปลงริมน้ำ",
    color: "bg-rose-500",
  },
};

export async function GET() {
  const bookedCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  let isGoogleSynced = false;

  try {
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

    if (credentialsRaw && SPREADSHEET_ID) {
      const credentials = JSON.parse(credentialsRaw);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      // ดึงชื่อแผ่นงานแรกอัตโนมัติ
      let sheetTitle = "Sheet1";
      try {
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        if (meta.data.sheets && meta.data.sheets.length > 0) {
          sheetTitle = meta.data.sheets[0].properties?.title || "Sheet1";
        }
      } catch (metaErr) {}

      // อ่านข้อมูลจากชีตเพื่อคำนวณจำนวนล็อคที่ถูกจองไปแล้ว
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetTitle}'!A:M`,
      });

      const allRows = res.data.values || [];
      // ตัดแถว Header ถ้ามี
      let dataRows = allRows;
      if (dataRows.length > 0) {
        const firstCell = String(dataRows[0][0] || "").toLowerCase();
        if (firstCell.includes("เวลา") || firstCell.includes("time") || firstCell.includes("ชื่อ")) {
          dataRows = dataRows.slice(1);
        }
      }

      dataRows.forEach((row) => {
        const zone = (row[6] || "").toUpperCase().trim();
        const boothCount = parseInt(row[9] || "1", 10) || 1;
        if (zone && bookedCounts[zone] !== undefined) {
          bookedCounts[zone] += boothCount;
        }
      });

      isGoogleSynced = true;
    }
  } catch (err: any) {
    console.warn("Could not query Google Sheets for live zone counts:", err.message);
  }

  // คำนวณจำนวนคงเหลือ (Remaining) = Total - Booked
  const zonesResult: Record<string, any> = {};

  Object.entries(DEFAULT_ZONES).forEach(([key, config]) => {
    const booked = bookedCounts[key] || 0;
    const remaining = Math.max(0, config.total - booked);
    zonesResult[key] = {
      ...config,
      booked,
      remaining,
    };
  });

  return NextResponse.json({
    success: true,
    isGoogleSynced,
    zones: zonesResult,
  });
}
