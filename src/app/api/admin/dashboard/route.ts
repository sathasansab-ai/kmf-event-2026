import { NextResponse } from "next/server";
import { google } from "googleapis";

function cleanSheetId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const SPREADSHEET_ID = cleanSheetId(process.env.GOOGLE_SHEET_ID ?? "");

export async function GET() {
  try {
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

    if (!credentialsRaw || !SPREADSHEET_ID) {
      return NextResponse.json({
        success: false,
        isGoogleConnected: false,
        message: "Google Sheets credentials not configured",
        stats: {
          totalVendors: 0,
          totalBooked: 0,
          totalDeposit: 0,
          totalFull: 0,
          zoneBooked: { A: 0, B: 0, C: 0, D: 0 },
        },
        vendors: [],
      });
    }

    const credentials = JSON.parse(credentialsRaw);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. ดึงชื่อแท็บชีตแรกอัตโนมัติ (รองรับทั้ง ชีต1, Sheet1, etc.)
    let sheetTitle = "Sheet1";
    try {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      if (meta.data.sheets && meta.data.sheets.length > 0) {
        sheetTitle = meta.data.sheets[0].properties?.title || "Sheet1";
      }
    } catch (metaErr: any) {
      console.warn("Could not get sheet metadata, using default:", metaErr?.message);
    }

    // 2. อ่านข้อมูลทั้งหมดจากแท็บชีตแรก
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetTitle}'!A:M`,
    });

    const allRows = res.data.values || [];

    const HEADERS = [
      "วันเวลาที่สมัคร",
      "ชื่อผู้สมัคร",
      "นามสกุล",
      "ชื่อร้านค้า",
      "เบอร์โทรศัพท์",
      "Line ID",
      "โซน",
      "ชื่อโซน",
      "ประเภทสินค้า",
      "จำนวนล็อค",
      "ราคาเต็มรวม (บาท)",
      "ยอดมัดจำ 50% (บาท)",
      "หลักฐานการโอนเงิน (สลิป)",
    ];

    // ตรวจสอบว่าแถวแรกเป็น Header หรือไม่
    let dataRows = allRows;
    if (dataRows.length > 0) {
      const firstCell = String(dataRows[0][0] || "").toLowerCase();
      if (
        firstCell.includes("เวลา") || 
        firstCell.includes("time") || 
        firstCell.includes("timestamp") || 
        firstCell.includes("ชื่อ")
      ) {
        dataRows = dataRows.slice(1);
      } else {
        // แถวแรกเป็นข้อมูลแต่ยังไม่มีหัวตาราง ให้แทรกหัวตารางลงแถว 1
        try {
          const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
          const sheetId = meta.data.sheets?.[0]?.properties?.sheetId || 0;
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
              requests: [{
                insertDimension: {
                  range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
                  inheritFromBefore: false,
                },
              }],
            },
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetTitle}'!A1:M1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [HEADERS] },
          });
        } catch (e) {}
      }
    } else {
      // แผ่นงานยังว่างเปล่า ให้สร้างหัวตารางเตรียมไว้
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${sheetTitle}'!A1:M1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [HEADERS] },
        });
      } catch (e) {}
    }

    let totalDeposit = 0;
    let totalFull = 0;
    let totalBooked = 0;
    const zoneBooked: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    const vendors = dataRows.map((row, index) => {
      const timestamp = row[0] || "-";
      const firstName = row[1] || "-";
      const lastName = row[2] || "-";
      const shopName = row[3] || "ร้านไม่ระบุชื่อ";
      const phone = row[4] || "-";
      const lineId = row[5] || "-";
      const zone = (row[6] || "").toUpperCase().trim();
      const zoneName = row[7] || `โซน ${zone}`;
      const category = row[8] || "-";
      const boothCount = parseInt(row[9] || "1", 10) || 1;
      const fullPrice = parseFloat((row[10] || "0").replace(/,/g, "")) || 0;
      const depositPrice = parseFloat((row[11] || "0").replace(/,/g, "")) || 0;
      const slipUrl = row[12] || "-";

      totalBooked += boothCount;
      totalDeposit += depositPrice;
      totalFull += fullPrice;

      if (zone && zoneBooked[zone] !== undefined) {
        zoneBooked[zone] += boothCount;
      }

      return {
        id: `V-${index + 1}`,
        timestamp,
        firstName,
        lastName,
        ownerName: `${firstName} ${lastName}`,
        shopName,
        phone,
        lineId,
        zone,
        zoneName,
        category,
        boothCount,
        totalDeposit: depositPrice,
        totalFull: fullPrice,
        slipUrl,
      };
    });

    // เรียงลำดับจากร้านที่สมัครล่าสุดขึ้นก่อน
    const vendorsReversed = [...vendors].reverse();

    return NextResponse.json({
      success: true,
      isGoogleConnected: true,
      sheetTitle,
      stats: {
        totalVendors: vendors.length,
        totalBooked,
        totalDeposit,
        totalFull,
        zoneBooked,
      },
      vendors: vendorsReversed,
    });

  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch Google Sheets data",
        stats: {
          totalVendors: 0,
          totalBooked: 0,
          totalDeposit: 0,
          totalFull: 0,
          zoneBooked: { A: 0, B: 0, C: 0, D: 0 },
        },
        vendors: [],
      },
      { status: 500 }
    );
  }
}
