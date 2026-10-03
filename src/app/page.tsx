import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 pt-16 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
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

          {/* Zones Summary */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
              🗺️ โซนที่เปิดรับสมัครร้านค้า
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="font-extrabold text-orange-900 text-sm">โซน A</div>
                <div className="text-xs text-orange-700 font-medium mt-1">ถนนคนเดิน</div>
                <div className="text-sm font-bold text-orange-800 mt-2">฿3,500</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="font-extrabold text-blue-900 text-sm">โซน B</div>
                <div className="text-xs text-blue-700 font-medium mt-1">ร้านค้า / Craft</div>
                <div className="text-sm font-bold text-blue-800 mt-2">฿2,500</div>
              </div>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <div className="font-extrabold text-teal-900 text-sm">โซน C</div>
                <div className="text-xs text-teal-700 font-medium mt-1">ตลาดริมน้ำ</div>
                <div className="text-sm font-bold text-teal-800 mt-2">฿2,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="font-extrabold text-rose-900 text-sm">โซน D</div>
                <div className="text-xs text-rose-700 font-medium mt-1">Food Truck</div>
                <div className="text-sm font-bold text-rose-800 mt-2">฿4,000</div>
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

      <footer className="text-center text-slate-400 text-sm py-8">
        &copy; 2026 KORAT MOVIE FESTIVAL · NEO CINEMA CARNIVAL
      </footer>
    </div>
  );
}
