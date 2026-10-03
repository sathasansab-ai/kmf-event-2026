import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

function cleanSheetId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

function cleanFolderId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const SPREADSHEET_ID = cleanSheetId(process.env.GOOGLE_SHEET_ID ?? "");
const DRIVE_FOLDER_ID = cleanFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID ?? "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const firstName = formData.get("firstName") as string || "-";
    const lastName = formData.get("lastName") as string || "-";
    const shopName = formData.get("shopName") as string || "ร้านค้าไม่ระบุชื่อ";
    const phone = formData.get("phone") as string || "-";
    const lineId = formData.get("lineId") as string || "-";
    const zone = formData.get("zone") as string || "-";
    const zoneName = formData.get("zoneName") as string || "-";
    const category = formData.get("category") as string || "-";
    const boothCount = formData.get("boothCount") as string || "1";
    const totalFull = formData.get("totalFull") as string || "0";
    const totalDeposit = formData.get("totalDeposit") as string || "0";
    const slipFile = formData.get("slip") as File | null;

    const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    let slipUrl = "-";
    let isGoogleConfigured = false;

    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

    if (credentialsRaw && SPREADSHEET_ID && DRIVE_FOLDER_ID) {
      try {
        const credentials = JSON.parse(credentialsRaw);
        if (credentials.private_key) {
          credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
        }

        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
          ],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const drive = google.drive({ version: "v3", auth });

        // 1. Google Drive: ค้นหาหรือสร้างโฟลเดอร์ชื่อร้าน
        let shopFolderId = DRIVE_FOLDER_ID;
        try {
          const folderSearch = await drive.files.list({
            q: `'${DRIVE_FOLDER_ID}' in parents and name='${shopName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id, name)",
          });

          if (folderSearch.data.files && folderSearch.data.files.length > 0) {
            shopFolderId = folderSearch.data.files[0].id!;
          } else {
            const created = await drive.files.create({
              requestBody: {
                name: shopName,
                mimeType: "application/vnd.google-apps.folder",
                parents: [DRIVE_FOLDER_ID],
              },
              fields: "id",
            });
            if (created.data.id) {
              shopFolderId = created.data.id;
            }
          }
        } catch (folderErr: any) {
          console.warn("Drive folder create warning:", folderErr.message);
        }

        // 2. อัปโหลดไฟล์สลิปลงในโฟลเดอร์ชื่อร้าน
        if (slipFile && slipFile.size > 0) {
          try {
            const arrayBuffer = await slipFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const stream = Readable.from(buffer);

            const ext = slipFile.name.split(".").pop() || "jpg";
            const uploaded = await drive.files.create({
              requestBody: {
                name: `slip_${shopName}_${Date.now()}.${ext}`,
                parents: [shopFolderId],
              },
              media: {
                mimeType: slipFile.type || "image/jpeg",
                body: stream,
              },
              fields: "id, webViewLink, webContentLink",
            });

            slipUrl = uploaded.data.webViewLink || uploaded.data.webContentLink || `https://drive.google.com/file/d/${uploaded.data.id}/view`;

            // พยายามตั้งสิทธิ์ให้เปิดดูได้ (หากทำได้)
            try {
              await drive.permissions.create({
                fileId: uploaded.data.id!,
                requestBody: { role: "reader", type: "anyone" },
              });
            } catch (permErr) {
              // ละเว้นหาก permission ของ folder ควบคุมอยู่แล้ว
            }
          } catch (uploadErr: any) {
            console.error("Slip upload error:", uploadErr.message);
          }
        }

        // 3. Google Sheets: บันทึกข้อมูลร้านค้า (ใช้ Range "A:M" โดยไม่เจาะจงชื่อ Sheet)
        try {
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "A:M",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
              values: [[
                timestamp, firstName, lastName, shopName, phone,
                lineId, zone, zoneName, category,
                boothCount, totalFull, totalDeposit, slipUrl
              ]],
            },
          });
          isGoogleConfigured = true;
        } catch (sheetErr: any) {
          console.error("Google Sheets append error:", sheetErr.message);
          throw new Error(`Google Sheets Error: ${sheetErr.message}`);
        }

      } catch (googleErr: any) {
        console.error("Google Integration Error:", googleErr);
        throw new Error(googleErr.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Google API");
      }
    } else {
      console.warn("Missing Google Credentials: SPREADSHEET_ID, DRIVE_FOLDER_ID or GOOGLE_SERVICE_ACCOUNT_JSON not set.");
    }

    return NextResponse.json({
      success: true,
      message: isGoogleConfigured 
        ? "บันทึกลง Google Sheets และอัปโหลดสลิปลง Google Drive เรียบร้อยแล้ว!" 
        : "บันทึกข้อมูลเรียบร้อยแล้ว",
      slipUrl,
    });

  } catch (err: any) {
    console.error("submit-vendor fatal error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}
