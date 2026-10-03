import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ดึงข้อมูลจากฟอร์ม
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const shopName = formData.get("shopName") as string;
    const phone = formData.get("phone") as string;
    const lineId = formData.get("lineId") as string;
    const zone = formData.get("zone") as string;
    const zoneName = formData.get("zoneName") as string;
    const category = formData.get("category") as string;
    const boothCount = formData.get("boothCount") as string;
    const totalFull = formData.get("totalFull") as string;
    const totalDeposit = formData.get("totalDeposit") as string;
    const slipFile = formData.get("slip") as File | null;

    const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    let slipUrl = "-";
    let isGoogleConfigured = false;

    // ตรวจสอบว่ามีการตั้งค่า Google Credentials หรือยัง
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (credentialsRaw && SPREADSHEET_ID && DRIVE_FOLDER_ID) {
      try {
        const credentials = JSON.parse(credentialsRaw);
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
        if (slipFile) {
          const folderSearch = await drive.files.list({
            q: `'${DRIVE_FOLDER_ID}' in parents and name='${shopName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id, name)",
          });

          let shopFolderId: string;
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
            shopFolderId = created.data.id!;
          }

          // อัปโหลดไฟล์สลิปลงในโฟลเดอร์ชื่อร้าน
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
            fields: "id, webViewLink",
          });

          // แชร์ให้เปิดดูลิงก์ได้
          await drive.permissions.create({
            fileId: uploaded.data.id!,
            requestBody: { role: "reader", type: "anyone" },
          });

          slipUrl = uploaded.data.webViewLink ?? "-";
        }

        // 2. Google Sheets: เขียนข้อมูลร้านค้าลงใน Sheet
        const sheetData = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: "Sheet1!A1:M1",
        });

        if (!sheetData.data.values || sheetData.data.values.length === 0) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: {
              values: [[
                "วันที่/เวลา", "ชื่อ", "นามสกุล", "ชื่อร้าน", "เบอร์โทร",
                "Line ID", "โซน", "รายละเอียดโซน", "ประเภทสินค้า",
                "จำนวนล็อค", "ราคาเต็ม (บาท)", "มัดจำ 50% (บาท)", "ลิงก์สลิปใน Google Drive"
              ]],
            },
          });
        }

        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: "Sheet1!A:M",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[
              timestamp, firstName, lastName, shopName, phone,
              lineId, zone, zoneName, category,
              boothCount, totalFull, totalDeposit, slipUrl
            ]],
          },
        });

        isGoogleConfigured = true;
      } catch (googleErr) {
        console.warn("Google API upload warning (falling back to local):", googleErr);
      }
    }

    // Backup ข้อมูลลงระบบจำลองในเซิร์ฟเวอร์เสมอ (ป้องกันข้อมูลสูญหาย)
    const backupDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dataFile = path.join(backupDir, "vendors.json");
    let currentVendors: any[] = [];
    if (fs.existsSync(dataFile)) {
      try {
        currentVendors = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
      } catch (e) {}
    }

    const newVendorRecord = {
      id: `V-${Date.now().toString().slice(-4)}`,
      timestamp,
      firstName,
      lastName,
      shopName,
      phone,
      lineId,
      zone,
      zoneName,
      category,
      boothCount,
      totalFull,
      totalDeposit,
      slipUrl: slipUrl !== "-" ? slipUrl : "local_uploaded",
      status: "รอตรวจสอบ",
      googleSynced: isGoogleConfigured,
    };

    currentVendors.unshift(newVendorRecord);
    fs.writeFileSync(dataFile, JSON.stringify(currentVendors, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: isGoogleConfigured 
        ? "บันทึกลง Google Sheets และอัปโหลดสลิปลง Google Drive โฟลเดอร์ชื่อร้านเรียบร้อยแล้ว!" 
        : "บันทึกข้อมูลเรียบร้อยแล้ว!",
      record: newVendorRecord,
    });

  } catch (err: any) {
    console.error("submit-vendor error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}
