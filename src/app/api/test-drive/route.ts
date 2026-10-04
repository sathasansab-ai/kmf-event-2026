import { NextResponse } from "next/server";
import { google } from "googleapis";

function cleanFolderId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const DRIVE_FOLDER_ID = cleanFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID ?? "");
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL?.trim() ?? "";

export async function GET() {
  const logs: string[] = [];
  const results: Record<string, any> = {
    folderIdConfigured: Boolean(DRIVE_FOLDER_ID),
    appsScriptUrlConfigured: Boolean(APPS_SCRIPT_URL),
  };

  logs.push(`Drive folder ID: ${DRIVE_FOLDER_ID || "❌ ไม่ได้ตั้งค่า"}`);
  logs.push(`Apps Script URL: ${APPS_SCRIPT_URL ? "✅ มีการตั้งค่าแล้ว" : "⚠️ ยังไม่ได้ตั้งค่า GOOGLE_APPS_SCRIPT_URL"}`);

  // 1. ตรวจสอบ Google Apps Script Web App (วิธีหลักสำหรับอัปโหลดสลิปบายพาส Quota)
  if (APPS_SCRIPT_URL) {
    try {
      logs.push("กำลังทดสอบส่งไฟล์ทดสอบผ่าน Google Apps Script...");
      const testBuffer = Buffer.from("KMF Diagnostic Test at " + new Date().toISOString());
      const gasRes = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: DRIVE_FOLDER_ID,
          shopName: "ระบบทดสอบ_SYSTEM_CHECK",
          fileName: `test_${Date.now()}.txt`,
          mimeType: "text/plain",
          base64: testBuffer.toString("base64"),
        }),
        redirect: "follow",
      });

      const text = await gasRes.text();
      let gasData: any = null;
      try {
        gasData = JSON.parse(text);
      } catch (e) {
        if (text.startsWith("http")) gasData = { url: text.trim() };
      }

      if (gasData?.url || (gasData?.success && gasData?.url)) {
        logs.push(`🎉 Apps Script ทำงานสำเร็จ 100%! ลิงก์ไฟล์: ${gasData.url}`);
        results.appsScriptStatus = "SUCCESS";
        results.testFileUrl = gasData.url;
      } else {
        logs.push(`❌ Apps Script ตอบกลับแต่ไม่พบ url: ${text.substring(0, 300)}`);
        results.appsScriptStatus = "FAILED";
        results.response = text.substring(0, 300);
      }
    } catch (gasErr: any) {
      logs.push(`❌ การเชื่อมต่อ Apps Script ขัดข้อง: ${gasErr.message}`);
      results.appsScriptStatus = "ERROR";
      results.appsScriptError = gasErr.message;
    }
  }

  // 2. ตรวจสอบ Service Account Folder Access
  try {
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
    if (credentialsRaw && DRIVE_FOLDER_ID) {
      const credentials = JSON.parse(credentialsRaw);
      if (credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
      }
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });
      const drive = google.drive({ version: "v3", auth });

      const folderInfo = await drive.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: "id, name, capabilities, owners",
        supportsAllDrives: true,
      });

      logs.push(`Google Drive Folder Name: "${folderInfo.data.name}" (เข้าถึงได้)`);
      results.driveFolderAccess = "OK";
    }
  } catch (err: any) {
    logs.push(`⚠️ Service Account เข้าถึงโฟลเดอร์ไม่สำเร็จ: ${err.message}`);
    results.driveFolderAccess = "FAILED";
  }

  const isReady = results.appsScriptStatus === "SUCCESS";

  return NextResponse.json({
    ready: isReady,
    summary: isReady 
      ? "ระบบอัปโหลดสลิปพร้อมใช้งาน 100% (Apps Script ผ่าน)" 
      : "ระบบอัปโหลดสลิปยังต้องการการติดตั้ง GOOGLE_APPS_SCRIPT_URL ใน Netlify",
    results,
    logs,
  });
}
