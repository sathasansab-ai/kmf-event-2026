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
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // อ่านข้อมูลร้านค้าทั้งหมดตั้งแต่แถวที่ 2 เป็นต้นไป (ข้าม Header แถวแรก)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "A2:M",
    });

    const rows = res.data.values || [];

    let totalDeposit = 0;
    let totalFull = 0;
    let totalBooked = 0;
    const zoneBooked: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

    const vendors = rows.map((row, index) => {
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

    // เรียงลำดับจากร้านล่าสุดขึ้นก่อน
    vendors.reverse();

    return NextResponse.json({
      success: true,
      isGoogleConnected: true,
      stats: {
        totalVendors: vendors.length,
        totalBooked,
        totalDeposit,
        totalFull,
        zoneBooked,
      },
      vendors,
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
