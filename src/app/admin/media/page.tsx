"use client";

import { useState } from "react";

export default function AdminMediaPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [mainMap, setMainMap] = useState<string | null>(null);
  const [zoneMaps, setZoneMaps] = useState<Record<string, string | null>>({
    A: null,
    B: null,
    C: null,
    D: null,
  });
  const [highlights, setHighlights] = useState<Record<string, string | null>>({
    screens: null,
    shows: null,
    food: null,
    checkin: null,
  });

  const [savedMsg, setSavedMsg] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setter(url);
      setSavedMsg("อัปโหลดและบันทึกรูปภาพเรียบร้อยแล้ว!");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            🖼️ จัดการรูปภาพ ผังงาน & โลโก้
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            อัปโหลดรูปภาพแผนผังงานแต่ละโซน ไฮไลต์ และโลโก้ที่จะนำไปแสดงในหน้าเว็บ
          </p>
        </div>

        {savedMsg && (
          <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-4 py-2 rounded-xl shadow-sm animate-pulse">
            ✅ {savedMsg}
          </span>
        )}
      </div>

      {/* 1. โลโก้งาน */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">1. โลโก้งานหลัก (Event Logo)</h2>
        <p className="text-slate-500 text-xs mb-4">แสดงบนแถบหัวข้อของเว็บและใบเสร็จ (แนะนำขนาดสี่เหลี่ยมหรือแนวนอน PNG โปร่งใส)</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-36 h-36 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden relative">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl text-slate-400">🎬</span>
            )}
          </div>
          <div className="space-y-2">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, setLogo)}
              className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-xs text-slate-400">รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5MB</p>
          </div>
        </div>
      </div>

      {/* 2. ผังงานรวม */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">2. ภาพแผนผังงานรวม (Master Event Map)</h2>
        <p className="text-slate-500 text-xs mb-4">แสดงในหน้าเลือกโซน เพื่อให้พ่อค้าแม่ค้าเห็นตำแหน่งภาพรวม 14 โซน</p>
        
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
          {mainMap ? (
            <img src={mainMap} alt="Master Map" className="max-h-72 object-contain rounded-lg" />
          ) : (
            <div className="text-center p-6">
              <span className="text-4xl text-slate-400">🗺️</span>
              <p className="text-sm font-semibold text-slate-600 mt-2">ยังไม่มีภาพแผนผังงานรวม</p>
              <p className="text-xs text-slate-400 mt-1">คลิกปุ่มด้านล่างเพื่ออัปโหลดภาพผังงาน</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e, setMainMap)}
            className="mt-4 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. ผังแยกแต่ละโซน */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">3. ภาพแผนผังแยกแต่ละโซน (Zone Maps)</h2>
        <p className="text-slate-500 text-xs mb-4">เมื่อผู้สมัครคลิกเลือกโซนใด รูปผังเฉพาะโซนนั้นจะแสดงให้เห็นทันที</p>
        
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

              <div className="my-3 h-32 border border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                {zoneMaps[z.key] ? (
                  <img src={zoneMaps[z.key]!} alt={`Zone ${z.key}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">ภาพผังโซน {z.key}</span>
                )}
              </div>

              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, (url) => setZoneMaps(prev => ({ ...prev, [z.key]: url })))}
                className="text-[11px] text-slate-500 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. ภาพไฮไลต์งาน */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">4. ภาพไฮไลต์กิจกรรม (Event Highlights)</h2>
        <p className="text-slate-500 text-xs mb-4">รูปภาพแสดงจุดเด่น 4 รายการในหน้าแรกของงาน</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "screens", icon: "🍿", title: "จอหนัง 5 สไตล์" },
            { key: "shows", icon: "🎭", title: "มหรสพ & นวัตกรรม" },
            { key: "food", icon: "🍔", title: "กิน-เที่ยว-ช้อป" },
            { key: "checkin", icon: "✨", title: "จุดเช็กอินสุดว้าว" },
          ].map((h) => (
            <div key={h.key} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between">
              <div>
                <span className="text-xl">{h.icon}</span>
                <h3 className="font-bold text-sm text-slate-800 mt-1">{h.title}</h3>
              </div>

              <div className="my-3 h-28 border border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                {highlights[h.key] ? (
                  <img src={highlights[h.key]!} alt={h.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-400">ยังไม่มีรูป</span>
                )}
              </div>

              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, (url) => setHighlights(prev => ({ ...prev, [h.key]: url })))}
                className="text-[11px] text-slate-500 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
