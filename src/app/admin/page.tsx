"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
        <button className="bg-[#1B1B1B] text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-gray-800 transition">
          🔄 รีเฟรชข้อมูล
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">ร้านค้าที่สมัครแล้ว</div>
          <div className="text-3xl font-extrabold text-gray-900">12 <span className="text-sm font-normal text-gray-500">ร้าน</span></div>
          <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 inline-block px-2 py-1 rounded">รอตรวจสอบสลิป 3 ร้าน</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">พื้นที่ว่างทั้งหมด</div>
          <div className="text-3xl font-extrabold text-gray-900">44 <span className="text-sm font-normal text-gray-500">ล็อค</span></div>
          <div className="mt-2 text-xs font-medium text-gray-500">จากทั้งหมด 60 ล็อค</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">ยอดเงินมัดจำ (ที่ได้รับแล้ว)</div>
          <div className="text-3xl font-extrabold text-[#C94232]">฿22,500</div>
          <div className="mt-2 text-xs font-medium text-gray-500">โอนผ่าน QR PromptPay</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-gray-500 text-sm font-medium mb-1">คาดการณ์รายได้รวม</div>
          <div className="text-3xl font-extrabold text-[#1F5B5A]">฿155,000</div>
          <div className="mt-2 text-xs font-medium text-gray-500">เมื่อขายเต็มทุกพื้นที่</div>
        </div>

      </div>

      {/* Zone Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">สถานะพื้นที่แต่ละโซน</h2>
        
        <div className="space-y-4">
          
          {/* Zone A */}
          <div>
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
              <span>โซน A (FESTIVAL MARKET) - ฿3,500/ล็อค</span>
              <span>11 / 30 ล็อค</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#F2A11B] h-3 rounded-full" style={{ width: '36%' }}></div>
            </div>
          </div>

          {/* Zone B */}
          <div>
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
              <span>โซน B (ART & MARKET) - ฿2,500/ล็อค</span>
              <span>3 / 15 ล็อค</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#1F5B5A] h-3 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>

          {/* Zone C */}
          <div>
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
              <span>โซน C (FOOD ZONE) - ฿2,000/ล็อค</span>
              <span>2 / 7 ล็อค</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-[#C94232] h-3 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>

          {/* Zone D */}
          <div>
            <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
              <span>โซน D (CINEMA BY THE RIVER) - ฿4,000/ล็อค</span>
              <span>0 / 8 ล็อค</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gray-400 h-3 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
