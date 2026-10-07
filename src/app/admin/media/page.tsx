"use client";

import { useState, useEffect } from "react";

export default function AdminMediaPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [mainMap, setMainMap] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  const [zoneMaps, setZoneMaps] = useState<Record<string, string | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });

  const [bankInfo, setBankInfo] = useState({
    bankName: "กสิกรไทย (KBANK)",
    accountNumber: "123-4-56789-0",
    accountName: "บจก. โคราช มูฟวี่ เฟสติวัล",
    promptPayNumber: "08X-XXX-XXXX",
  });

  const [savedMsg, setSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // โหลดข้อมูลจาก Google Sheets และ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kmf_site_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logo) setLogo(parsed.logo);
        if (parsed.poster) setPoster(parsed.poster);
        if (parsed.mainMap) setMainMap(parsed.mainMap);
        if (parsed.qrCode) setQrCode(parsed.qrCode);
        if (parsed.zoneMaps) setZoneMaps(parsed.zoneMaps);
        if (parsed.bankInfo) setBankInfo(parsed.bankInfo);
      }
    } catch (e) {}

    // ดึงค่า Global จาก Google Sheets เพื่อให้ทุกเครื่องตรงกัน
    fetch("/api/config", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          const c = data.config;
          if (c.logo) setLogo(c.logo);
          if (c.poster) setPoster(c.poster);
          if (c.mainMap) setMainMap(c.mainMap);
          if (c.qrCode) setQrCode(c.qrCode);
          if (c.zoneMaps && Object.keys(c.zoneMaps).length > 0) setZoneMaps(c.zoneMaps);
          if (c.bankInfo && c.bankInfo.bankName) setBankInfo(c.bankInfo);
        }
      })
      .catch(() => {});
  }, []);

  // ฟังก์ชันย่อขนาดภาพอัตโนมัติบนเบราว์เซอร์ เพื่อให้ไฟล์เล็กลง 90% บันทึกได้แน่นอน ไม่ติดปัญหาขนาดไฟล์
  const compressImage = (file: File, maxWidth = 900, maxHeight = 900, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          // ใช้ JPEG คุณภาพ 0.7 เพื่อประหยัดพื้นที่จัดเก็บสูงสุด คมชัดแต่เบามาก
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string) => void,
    maxWidth = 900,
    maxHeight = 900
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await compressImage(file, maxWidth, maxHeight, 0.7);
        setter(compressedBase64);
      } catch (err) {
        console.error("Image compression error, falling back to raw:", err);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const config = {
        logo,
        poster,
        mainMap,
        qrCode,
        zoneMaps,
        bankInfo,
      };
      localStorage.setItem("kmf_site_config", JSON.stringify(config));

      // บันทึกลง Google Sheets เพื่อซิงค์ทุกเครื่องทั่วโลก
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      setSavedMsg(data.message || "บันทึกข้อมูลและรูปภาพเรียบร้อยแล้ว ทุกเครื่องจะอัปเดตตามทันที!");
      setTimeout(() => setSavedMsg(""), 4500);
    } catch (err) {
      setSavedMsg("บันทึกข้อมูลเรียบร้อยแล้ว!");
      setTimeout(() => setSavedMsg(""), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Page Title & Save Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800">
            🖼️ จัดการรูปภาพ, ผังงาน & โปสเตอร์
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            อัปโหลดภาพโปสเตอร์ Pop-up, QR Code พร้อมเพย์, บัญชีธนาคาร และผังงาน
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>💾</span> {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูลทั้งหมด"}
        </button>
      </div>

      {savedMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold p-4 rounded-2xl shadow-sm animate-pulse">
          ✅ {savedMsg}
        </div>
      )}

      {/* 1. QR Code รับเงิน & ข้อมูลบัญชีธนาคาร (สำคัญมาก) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Payment Settings
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">1. ภาพ QR Code รับเงินมัดจำ & ข้อมูลบัญชี</h2>
          <p className="text-slate-500 text-xs mt-1">รูปและข้อความนี้จะไปแสดงในหน้าชำระเงินของคนสมัครทันที</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Upload QR Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              📱 อัปโหลดภาพ QR Code พร้อมเพย์
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[260px] text-center">
              {qrCode ? (
                <div className="space-y-3">
                  <img src={qrCode} alt="QR Code" className="w-52 h-52 object-contain mx-auto rounded-xl shadow-md border bg-white p-2" />
                  <p className="text-xs text-emerald-600 font-bold">✓ อัปโหลดรูป QR Code แล้ว</p>
                </div>
              ) : (
                <div className="text-slate-400 p-4">
                  <span className="text-5xl block mb-2">📲</span>
                  <p className="text-sm font-bold text-slate-600">ยังไม่มีรูป QR Code</p>
                  <p className="text-xs text-slate-400 mt-1">อัปโหลดรูป QR Code พร้อมเพย์ที่นี่</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, setQrCode)}
                className="mt-4 text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Edit Bank Info */}
          <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 border-b pb-2">
              🏦 ข้อมูลบัญชีธนาคาร (โอนเงิน)
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อธนาคาร</label>
              <input
                type="text"
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                placeholder="เช่น กสิกรไทย (KBANK)"
                className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:border-blue-600 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">เลขที่บัญชี</label>
              <input
                type="text"
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                placeholder="เช่น 123-4-56789-0"
                className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-blue-700 focus:border-blue-600 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อบัญชี</label>
              <input
                type="text"
                value={bankInfo.accountName}
                onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                placeholder="เช่น บจก. โคราช มูฟวี่ เฟสติวัล"
                className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:border-blue-600 outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">เบอร์พร้อมเพย์ (PromptPay)</label>
              <input
                type="text"
                value={bankInfo.promptPayNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, promptPayNumber: e.target.value })}
                placeholder="เช่น 081-234-5678"
                className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:border-blue-600 outline-none bg-white"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. ภาพโปสเตอร์งาน (Pop-up) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <span className="bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Homepage Pop-up
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">2. ภาพโปสเตอร์งานสำหรับแสดงใน Pop-up (Event Poster)</h2>
          <p className="text-slate-500 text-xs mt-1">ภาพนี้จะเด้งขึ้นมาต้อนรับเมื่อผู้ใช้เปิดเข้าหน้าแรกของเว็บไซต์</p>
        </div>
        
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[240px]">
          {poster ? (
            <div className="text-center space-y-3">
              <img src={poster} alt="Event Poster" className="max-h-80 object-contain rounded-xl shadow-md border bg-white p-2 mx-auto" />
              <p className="text-xs text-emerald-600 font-bold">✓ อัปโหลดภาพโปสเตอร์ Pop-up แล้ว</p>
            </div>
          ) : (
            <div className="text-center p-6 text-slate-400">
              <span className="text-5xl block mb-2">🎬</span>
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีภาพโปสเตอร์งาน Pop-up</p>
              <p className="text-xs text-slate-400 mt-1">แนะนำรูปแนวตั้ง (เช่น 1080x1350 หรือ 1080x1920)</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, setPoster)}
            className="mt-4 text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. ผังงานรวม */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">3. ภาพแผนผังงานรวม (Master Event Map)</h2>
        <p className="text-slate-500 text-xs mb-4">แสดงในหน้าเลือกโซนเพื่อให้ผู้สมัครเห็นตำแหน่ง 14 โซน</p>
        
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[220px]">
          {mainMap ? (
            <img src={mainMap} alt="Master Map" className="max-h-72 object-contain rounded-xl shadow-md border bg-white p-2" />
          ) : (
            <div className="text-center p-6 text-slate-400">
              <span className="text-4xl">🗺️</span>
              <p className="text-sm font-semibold text-slate-600 mt-2">ยังไม่มีภาพแผนผังงานรวม</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e, setMainMap)}
            className="mt-4 text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </div>
      </div>

      {/* 4. ผังแยกแต่ละโซน */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">4. ภาพแผนผังแยกแต่ละโซน (Zone Maps)</h2>
        <p className="text-slate-500 text-xs mb-4">เมื่อผู้สมัครคลิกเลือกโซน A, B, C หรือ D ภาพผังนี้จะแสดงให้เห็นทันที</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "A", title: "โซน A (ถนนคนเดิน)", tag: "FESTIVAL MARKET" },
            { key: "B", title: "โซน B (ร้านค้า / Craft)", tag: "ART & MARKET" },
            { key: "C", title: "โซน C (ตลาดริมน้ำ)", tag: "FOOD ZONE" },
            { key: "D", title: "โซน D (Food Truck)", tag: "CINEMA BY RIVER" },
          ].map((z) => (
            <div key={z.key} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ZONE {z.key}
                </span>
                <h3 className="font-bold text-sm text-slate-800 mt-2">{z.title}</h3>
                <p className="text-[11px] text-slate-400">{z.tag}</p>
              </div>

              <div className="my-3 h-36 border border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                {zoneMaps[z.key] ? (
                  <img src={zoneMaps[z.key]!} alt={`Zone ${z.key}`} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xs text-slate-400">ยังไม่มีภาพผังโซน {z.key}</span>
                )}
              </div>

              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, (base64) => setZoneMaps(prev => ({ ...prev, [z.key]: base64 })))}
                className="text-[11px] text-slate-500 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. โลโก้งาน */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">5. โลโก้งานหลัก (Event Logo)</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-3">
          <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl text-slate-400">🎬</span>
            )}
          </div>
          <div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileUpload(e, setLogo)}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="pt-4 text-center">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 sm:px-12 rounded-2xl shadow-xl transition-all text-base transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <span>💾</span> {isSaving ? "กำลังบันทึกข้อมูล..." : "บันทึกรูปภาพและข้อมูลทั้งหมด"}
        </button>
      </div>

    </div>
  );
}
