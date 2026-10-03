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

            const rawExt = (slipFile.name || "").split(".").pop()?.toLowerCase() || "jpg";
            const safeExt = ["jpg", "jpeg", "png", "webp", "pdf"].includes(rawExt) ? rawExt : "jpg";
            const safeFileName = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${safeExt}`;

            // หากมีการตั้งค่า GOOGLE_APPS_SCRIPT_URL (สำหรับบายพาส Quota Service Account) ให้ใช้วิธีนี้ก่อน
            const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
            if (appsScriptUrl && appsScriptUrl.startsWith("http")) {
              try {
                const gasRes = await fetch(appsScriptUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    folderId: DRIVE_FOLDER_ID,
                    shopName,
                    fileName: safeFileName,
                    mimeType: slipFile.type || "image/jpeg",
                    base64: buffer.toString("base64"),
                  }),
                  redirect: "follow",
                });
                const text = await gasRes.text();
                let gasData: any = null;
                try {
                  gasData = JSON.parse(text);
                } catch (pe) {
                  if (text.startsWith("http")) gasData = { url: text.trim() };
                }
                if (gasData?.url) {
                  slipUrl = gasData.url;
                }
              } catch (gasErr: any) {
                console.warn("Apps Script upload warn:", gasErr?.message);
              }
            }

            // หากยังไม่ได้ slipUrl ให้ใช้วิธี Google Drive API ตามปกติ
            if (slipUrl === "-") {
              let uploaded: any = null;
              try {
                uploaded = await drive.files.create({
                  requestBody: {
                    name: safeFileName,
                    parents: [shopFolderId],
                    description: `สลิปโอนเงิน ร้าน: ${shopName} โซน: ${zone} วันที่: ${timestamp}`,
                  },
                  media: {
                    mimeType: slipFile.type || "image/jpeg",
                    body: Readable.from(buffer),
                  },
                  fields: "id, name, webViewLink, webContentLink",
                  supportsAllDrives: true,
                });
              } catch (folderUploadErr: any) {
                console.warn("Upload to shop folder failed, trying root folder:", folderUploadErr?.message);
                // Fallback: หากอัปโหลดลงโฟลเดอร์ย่อยมีปัญหา ให้เซฟลงโฟลเดอร์หลัก
                uploaded = await drive.files.create({
                  requestBody: {
                    name: safeFileName,
                    parents: [DRIVE_FOLDER_ID],
                    description: `สลิปโอนเงิน ร้าน: ${shopName} โซน: ${zone} วันที่: ${timestamp}`,
                  },
                  media: {
                    mimeType: slipFile.type || "image/jpeg",
                    body: Readable.from(buffer),
                  },
                  fields: "id, name, webViewLink, webContentLink",
                  supportsAllDrives: true,
                });
              }

              if (uploaded?.data?.id) {
                slipUrl = `https://drive.google.com/file/d/${uploaded.data.id}/view?usp=sharing`;

                // พยายามตั้งสิทธิ์ให้อ่านได้ผ่านลิงก์
                try {
                  await drive.permissions.create({
                    fileId: uploaded.data.id,
                    requestBody: { role: "reader", type: "anyone" },
                    supportsAllDrives: true,
                  });
                } catch (permErr: any) {
                  console.warn("Drive permission create warning:", permErr?.message);
                }
              }
            }
          } catch (uploadErr: any) {
            console.error("Slip upload critical error:", uploadErr);
            slipUrl = `ERROR: ${uploadErr.message || String(uploadErr)}`;
          }
        }

        // 3. Google Sheets: บันทึกข้อมูลร้านค้า (หาชื่อชีตอัตโนมัติ และสร้างหัวตารางหากยังไม่มี)
        let sheetTitle = "Sheet1";
        let sheetId = 0;
        try {
          const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
          if (meta.data.sheets && meta.data.sheets.length > 0) {
            sheetTitle = meta.data.sheets[0].properties?.title || "Sheet1";
            sheetId = meta.data.sheets[0].properties?.sheetId || 0;
          }
        } catch (metaErr) {}

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

        // ตรวจสอบและสร้างหัวตารางที่แถว 1 อัตโนมัติ
        try {
          const headerCheck = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetTitle}'!A1:M1`,
          });
          const firstRow = headerCheck.data.values?.[0] || [];

          if (firstRow.length === 0) {
            // แถว 1 ว่างเปล่า -> เขียนหัวตารางลงไปได้เลย
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `'${sheetTitle}'!A1:M1`,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [HEADERS] },
            });
          } else {
            // แถว 1 มีข้อมูล -> ตรวจดูว่าเป็นหัวตารางอยู่แล้วหรือไม่
            const cell0 = String(firstRow[0] || "").toLowerCase();
            const isAlreadyHeader = cell0.includes("เวลา") || cell0.includes("time") || cell0.includes("timestamp");
            if (!isAlreadyHeader) {
              // แทรกแถวใหม่ที่แถว 1 แล้วใส่หัวตาราง
              try {
                await sheets.spreadsheets.batchUpdate({
                  spreadsheetId: SPREADSHEET_ID,
                  requestBody: {
                    requests: [
                      {
                        insertDimension: {
                          range: {
                            sheetId: sheetId,
                            dimension: "ROWS",
                            startIndex: 0,
                            endIndex: 1,
                          },
                          inheritFromBefore: false,
                        },
                      },
                    ],
                  },
                });
                await sheets.spreadsheets.values.update({
                  spreadsheetId: SPREADSHEET_ID,
                  range: `'${sheetTitle}'!A1:M1`,
                  valueInputOption: "USER_ENTERED",
                  requestBody: { values: [HEADERS] },
                });
              } catch (insErr) {
                console.warn("Could not insert header row:", insErr);
              }
            }
          }
        } catch (hErr) {
          console.warn("Header setup warning:", hErr);
        }

        // ป้องกัน Google Sheets ตัดเลข 0 ข้างหน้าของเบอร์โทรและ Line ID
        const formattedPhone = phone ? (phone.startsWith("'") ? phone : `'${phone}`) : "-";
        const formattedLineId = lineId ? (lineId.startsWith("'") ? lineId : `'${lineId}`) : "-";

        try {
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetTitle}'!A:M`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
              values: [[
                timestamp, firstName, lastName, shopName, formattedPhone,
                formattedLineId, zone, zoneName, category,
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
