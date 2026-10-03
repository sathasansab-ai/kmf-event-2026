import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

function cleanFolderId(idOrUrl: string): string {
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

const DRIVE_FOLDER_ID = cleanFolderId(process.env.GOOGLE_DRIVE_FOLDER_ID ?? "");

export async function GET() {
  const logs: string[] = [];
  try {
    const credentialsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
    if (!credentialsRaw || !DRIVE_FOLDER_ID) {
      return NextResponse.json({
        success: false,
        error: "Missing credentials or DRIVE_FOLDER_ID",
      });
    }

    const credentials = JSON.parse(credentialsRaw);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    logs.push(`Drive folder ID: ${DRIVE_FOLDER_ID}`);
    logs.push(`Service account: ${credentials.client_email}`);

    // 1. ตรวจสอบโฟลเดอร์หลัก
    const folderInfo = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: "id, name, capabilities, owners",
      supportsAllDrives: true,
    });
    logs.push(`Main Folder Name: ${folderInfo.data.name}`);
    logs.push(`CanAddChildren: ${folderInfo.data.capabilities?.canAddChildren}`);

    // 2. ทดลองอัปโหลดไฟล์ทดสอบขนาดเล็ก
    const buffer = Buffer.from("Test upload from KMF system at " + new Date().toISOString());
    const stream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    const uploadRes = await drive.files.create({
      requestBody: {
        name: `test_upload_${Date.now()}.txt`,
        parents: [DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: "text/plain",
        body: stream,
      },
      fields: "id, name, webViewLink",
      supportsAllDrives: true,
    });

    logs.push(`Upload Success! File ID: ${uploadRes.data.id}`);
    logs.push(`File Link: ${uploadRes.data.webViewLink}`);

    return NextResponse.json({
      success: true,
      logs,
      file: uploadRes.data,
    });

  } catch (err: any) {
    logs.push(`Error: ${err.message}`);
    if (err.response?.data) {
      logs.push(`API Error Details: ${JSON.stringify(err.response.data)}`);
    }
    return NextResponse.json({
      success: false,
      logs,
      error: err.message,
      details: err.response?.data || null,
    }, { status: 500 });
  }
}
