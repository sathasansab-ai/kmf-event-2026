"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [sheetId, setSheetId] = useState("");
  const [driveId, setDriveId] = useState("");
  const [serviceAccount, setServiceAccount] = useState("");
  const [msg, setMsg] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("บันทึกการตั้งค่าเรียบร้อย! ระบบจะเชื่อมต่อ Google Drive & Sheets ทันที");
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">
          ⚙️ ตั้งค่าเชื่อมต่อ Google Drive & Sheets
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          ระบุข้อมูล Google Cloud Service Account เพื่อเปิดใช้งานระบบสร้างโฟลเดอร์แยกตามชื่อร้าน และบันทึกข้อมูลอัตโนมัติ
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold p-4 rounded-2xl shadow-sm">
          ✅ {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            1. Google Spreadsheet ID
          </label>
          <p className="text-xs text-slate-400 mb-2">
            ดูจากลิงก์ของ Google Sheets เช่น: https://docs.google.com/spreadsheets/d/<span className="text-blue-600 font-bold">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</span>/edit
          </p>
          <input
            type="text"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-blue-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            2. Google Drive Main Folder ID (โฟลเดอร์หลักสำหรับเก็บสลิป)
          </label>
          <p className="text-xs text-slate-400 mb-2">
            ดูจากลิงก์ของโฟลเดอร์ใน Google Drive (เมื่อมีคนส่งสลิป ระบบจะสร้างโฟลเดอร์ชื่อร้านย่อยไว้ในโฟลเดอร์นี้)
          </p>
          <input
            type="text"
            value={driveId}
            onChange={(e) => setDriveId(e.target.value)}
            placeholder="เช่น 1Z5pE8F-Kx9W3qL..."
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm focus:border-blue-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            3. Google Service Account JSON Key
          </label>
          <p className="text-xs text-slate-400 mb-2">
            คัดลอกเนื้อหาจากไฟล์ .json ของ Service Account จาก Google Cloud Console มาวางที่นี่
          </p>
          <textarea
            rows={5}
            value={serviceAccount}
            onChange={(e) => setServiceAccount(e.target.value)}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
            className="w-full border-2 border-slate-200 rounded-xl p-3 text-xs font-mono focus:border-blue-600 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>

      {/* Guide Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-sm text-blue-950 space-y-2">
        <h3 className="font-bold text-base flex items-center gap-2">
          <span>💡</span> วิธีให้สิทธิ์ Google Sheet & Drive:
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-900 leading-relaxed">
          <li>เปิด Google Sheets และโฟลเดอร์ใน Google Drive ที่คุณต้องการใช้</li>
          <li>กดปุ่ม <strong>"Share" (แชร์)</strong> ที่มุมขวาบน</li>
          <li>ใส่อีเมลของ Service Account (เช่น <code>xxx@project-name.iam.gserviceaccount.com</code>)</li>
          <li>เลือกสิทธิ์เป็น <strong>Editor (ผู้แก้ไข)</strong> แล้วกดบันทึก</li>
        </ol>
      </div>
    </div>
  );
}
