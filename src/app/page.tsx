"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [showPoster, setShowPoster] = useState(true);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [zonePrices, setZonePrices] = useState({
    A: 3500,
    B: 2500,
    C: 2000,
    D: 4000,
  });

  useEffect(() => {
    // 1. โหลดจาก localStorage เบื้องต้น
    try {
      const savedMedia = localStorage.getItem("kmf_site_config");
      if (savedMedia) {
        const parsed = JSON.parse(savedMedia);
        if (parsed.poster) setPosterUrl(parsed.poster);
        if (parsed.logo) setLogoUrl(parsed.logo);
      }
    } catch (e) {}

    // 2. ดึงค่า Global Configuration จาก Google Sheets (ทำให้ทุกเครื่องเห็นรูปและราคาตรงกัน 100%)
    fetch("/api/config", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          if (data.config.poster) setPosterUrl(data.config.poster);
          if (data.config.logo) setLogoUrl(data.config.logo);
          if (data.config.zones && Array.isArray(data.config.zones)) {
            const newPrices: any = {};
            data.config.zones.forEach((z: any) => {
              if (z.key && z.price) newPrices[z.key] = z.price;
            });
            setZonePrices(prev => ({ ...prev, ...newPrices }));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* 🎬 Pop-up โปสเตอร์งาน (แสดงเมื่อเปิดเว็บ และกดปิดได้) */}
      {showPoster && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-slate-800 border-4 border-amber-400">
            {/* Close Button */}
            <button
              onClick={() => setShowPoster(false)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center text-sm font-black transition z-10"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>

            {/* Poster Image */}
            <div className="bg-slate-950 min-h-[360px] flex items-center justify-center text-center p-2">
              {posterUrl ? (
                <img src={posterUrl} alt="Event Poster" className="max-h-[500px] w-full object-contain rounded-2xl" />
              ) : (
                <div className="p-8 text-slate-300 space-y-3">
                  <span className="text-6xl block">🎬</span>
                  <div className="inline-block border border-amber-400 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                    NEO CINEMA CARNIVAL : ดูด้วยกัน
                  </div>
                  <h3 className="text-2xl font-black text-white">KORAT MOVIE FESTIVAL 2026</h3>
                  <p className="text-xs text-slate-400">20 - 24 ตุลาคม 2569 · ตลาดน้ำบึงหัวทะเล</p>
                  <p className="text-[11px] text-amber-300/80 bg-amber-950/50 p-2 rounded-xl">
                    (ผู้จัดงานสามารถอัปโหลดภาพโปสเตอร์จริงได้ที่เมนู /admin/media)
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowPoster(false)}
                className="w-1/2 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition"
              >
                เข้าสู่เว็บไซต์
              </button>
              <Link
                href="/register"
                onClick={() => setShowPoster(false)}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm text-center shadow transition"
              >
                จองล็อคทันที 🎟️
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 pt-16 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          )}
          <div className="inline-block bg-amber-500/20 border border-amber-400 text-amber-300 px-5 py-2 rounded-full text-sm font-bold tracking-wider mb-6">
            🎬 NEO CINEMA CARNIVAL : ดูด้วยกัน
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-lg">
            KORAT MOVIE <span className="text-amber-400">FESTIVAL</span> 2026
          </h1>
          <p className="text-xl md:text-2xl text-teal-300 font-bold mb-4">
            เทศกาลหนังเมืองโคราช ✨
          </p>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            สิ้นสุดการรอคอย! เปิดม่านอย่างเป็นทางการ ที่จะเปลี่ยนค่ำคืนของโคราชให้สว่างไสวด้วยแสงสีและมนต์เสน่ห์ของภาพยนตร์ในรูปแบบที่คาดไม่ถึง
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-[-1.5rem] relative z-10">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-200">
          
          {/* Date & Location Header */}
          <div className="text-center pb-6 border-b border-slate-200">
            <span className="inline-block bg-rose-100 text-rose-700 font-black text-lg md:text-xl px-6 py-2 rounded-full mb-3">
              🗓 วันที่: 20 - 24 ตุลาคม 2569
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              📍 สถานที่: ตลาดน้ำบึงหัวทะเล จังหวัดนครราชสีมา
            </h2>
          </div>

          {/* Highlights */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              🎪 ไฮไลต์สุดพิเศษภายในงานที่คุณห้ามพลาด
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex gap-4 items-start">
                <span className="text-3xl">🍿</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">จอหนัง 5 สไตล์</h4>
                  <p className="text-sm text-slate-600 mt-1">จอภาพยนตร์สไตล์งานวัด, จอวินเทจ, จอโรแมนติก, จอเฉพาะกลุ่ม และจอ 3 มิติสุดล้ำ</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex gap-4 items-start">
                <span className="text-3xl">🎭</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">มหรสพและนวัตกรรม</h4>
                  <p className="text-sm text-slate-600 mt-1">เวทีหลักจัดเต็มลิเกดัง ฉาก LED อลังการ คณะวรต้อ, พงษ์เพชรเบญจพร, กล้วยหอมบรรจงศิลป์</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex gap-4 items-start">
                <span className="text-3xl">🍔</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">กิน-เที่ยว-ช้อป ครบจบ</h4>
                  <p className="text-sm text-slate-600 mt-1">โซนฟู้ดทรัค ของกินสตรีทฟู้ด ร้านค้าวินเทจ สินค้าโอท็อป พร้อมเครื่องเล่นงานวัด</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex gap-4 items-start">
                <span className="text-3xl">✨</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">จุดเช็กอินสุดว้าว</h4>
                  <p className="text-sm text-slate-600 mt-1">นิทรรศการภาพยนตร์ และโซนน้ำพุเต้นระบำ ถ่ายรูปสวยทุกมุม</p>
                </div>
              </div>
            </div>
          </div>

          {/* Zones Summary (ราคาซิงค์ตรงกับ Admin) */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
              🗺️ โซนที่เปิดรับสมัครร้านค้า
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="font-extrabold text-orange-900 text-sm">โซน A</div>
                <div className="text-xs text-orange-700 font-medium mt-1">ถนนคนเดิน</div>
                <div className="text-sm font-bold text-orange-800 mt-2">฿{zonePrices.A.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="font-extrabold text-blue-900 text-sm">โซน B</div>
                <div className="text-xs text-blue-700 font-medium mt-1">ร้านค้า / Craft</div>
                <div className="text-sm font-bold text-blue-800 mt-2">฿{zonePrices.B.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="font-extrabold text-teal-900 text-sm">โซน C</div>
                <div className="text-xs text-teal-700 font-medium mt-1">ตลาดริมน้ำ</div>
                <div className="text-sm font-bold text-teal-800 mt-2">฿{zonePrices.C.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="font-extrabold text-rose-900 text-sm">โซน D</div>
                <div className="text-xs text-rose-700 font-medium mt-1">Food Truck</div>
                <div className="text-sm font-bold text-rose-800 mt-2">฿{zonePrices.D.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-10 pt-6 text-center">
            <p className="text-sm text-slate-500 mb-4 font-medium">
              * จองล็อควันนี้ ชำระมัดจำเพียง 50% ส่วนที่เหลือชำระวันงาน
            </p>
            <Link 
              href="/register"
              className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-lg md:text-xl py-4 px-12 rounded-full shadow-xl transition-all transform hover:-translate-y-1"
            >
              สมัครจองพื้นที่ร้านค้า 🎟️
            </Link>
          </div>

        </div>
      </main>

      <footer className="text-center text-slate-400 text-sm py-8 space-y-2">
        <p>&copy; 2026 KORAT MOVIE FESTIVAL · NEO CINEMA CARNIVAL</p>
        <p>
          <Link href="/admin" className="text-xs text-slate-500 hover:text-amber-400 transition font-medium">
            🔒 เข้าสู่ระบบผู้ดูแล (Admin Login)
          </Link>
        </p>
      </footer>
    </div>
  );
}
