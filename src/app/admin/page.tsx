"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ZoneItem {
  key: string;
  name: string;
  title: string;
  price: number;
  total: number;
  booked: number;
}

const DEFAULT_ZONES: ZoneItem[] = [
  { key: "A", name: "ถนนคนเดิน (FESTIVAL MARKET)", title: "ของทานเล่น, อาหารจานหลัก, เครื่องดื่ม", price: 3500, total: 30, booked: 0 },
  { key: "B", name: "ร้านค้า / ร้าน Craft (ART & MARKET)", title: "งานคราฟท์, เสื้อผ้า, งานปูนปาสเตอร์, ของแต่งบ้าน", price: 2500, total: 15, booked: 0 },
  { key: "C", name: "ตลาดริมน้ำ (FOOD ZONE)", title: "สินค้าท้องถิ่น, อาหารพื้นบ้าน, ผลไม้", price: 2000, total: 7, booked: 0 },
  { key: "D", name: "Food Truck (CINEMA BY THE RIVER)", title: "รถฟู้ดทรัค อาหารและเครื่องดื่ม", price: 4000, total: 8, booked: 0 },
];

export default function AdminDashboard() {
  const [zones, setZones] = useState<ZoneItem[]>(DEFAULT_ZONES);
  const [refreshToast, setRefreshToast] = useState("");

  const loadZoneConfig = () => {
    try {
      const saved = localStorage.getItem("kmf_zone_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setZones(parsed);
          return true;
        }
      }
    } catch (e) {}
    return false;
  };

  useEffect(() => {
    loadZoneConfig();
  }, []);

  const handleRefresh = () => {
    loadZoneConfig();
    setRefreshToast("✓ รีเฟรชข้อมูลล่าสุดจากระบบแล้ว");
    setTimeout(() => setRefreshToast(""), 3000);
  };

  // คำนวณตัวเลขสถิติแบบ Real-time ตามที่ตั้งค่าใน /admin/zones
  const totalBooths = zones.reduce((sum, z) => sum + (Number(z.total) || 0), 0);
  const bookedBooths = zones.reduce((sum, z) => sum + (Number(z.booked) || 0), 0);
  const availableBooths = Math.max(0, totalBooths - bookedBooths);
  const totalDeposit = zones.reduce((sum, z) => sum + ((Number(z.booked) || 0) * (Number(z.price) || 0) / 2), 0);
  const projectedRevenue = zones.reduce((sum, z) => sum + ((Number(z.total) || 0) * (Number(z.price) || 0)), 0);

  const zoneColors: Record<string, string> = {
    A: "#F2A11B",
    B: "#1F5B5A",
    C: "#C94232",
    D: "#3B82F6",
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
          <p className="text-sm text-gray-500 mt-1">
            ข้อมูลอัปเดตอัตโนมัติตามการตั้งค่าในเมนู &ldquo;จัดการโซน &amp; ราคา&rdquo;
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="bg-[#1B1B1B] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span> รีเฟรชข้อมูล
        </button>
      </div>

      {refreshToast && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold px-4 py-3 rounded-xl shadow-sm animate-pulse">
          {refreshToast}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* ล็อคที่จองแล้ว */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">ล็อคที่จองแล้ว (Booked)</div>
          <div className="text-3xl font-extrabold text-gray-900">
            {bookedBooths} <span className="text-sm font-normal text-gray-500">ล็อค</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-2.5 py-1 rounded-lg">
            {totalBooths > 0 ? ((bookedBooths / totalBooths) * 100).toFixed(1) : 0}% ของทั้งหมด
          </div>
        </div>

        {/* ล็อคว่างทั้งหมด */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">พื้นที่ว่างทั้งหมด</div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {availableBooths} <span className="text-sm font-normal text-gray-500">ล็อค</span>
          </div>
          <div className="mt-2 text-xs font-medium text-gray-500">
            จากทั้งหมด {totalBooths} ล็อค
          </div>
        </div>

        {/* ยอดเงินมัดจำ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">ยอดเงินมัดจำ (ที่ได้รับ)</div>
          <div className="text-3xl font-extrabold text-[#C94232]">
            ฿{totalDeposit.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-gray-500">
            มัดจำ 50% ต่อล็อค
          </div>
        </div>

        {/* คาดการณ์รายได้รวม */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">คาดการณ์รายได้รวม</div>
          <div className="text-3xl font-extrabold text-[#1F5B5A]">
            ฿{projectedRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-gray-500">
            เมื่อขายเต็มทุกพื้นที่
          </div>
        </div>

      </div>

      {/* Zone Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">สถานะพื้นที่แต่ละโซน</h2>
          <Link 
            href="/admin/zones" 
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ✏️ แก้ไขจำนวน &amp; ราคาโซน
          </Link>
        </div>
        
        <div className="space-y-6">
          {zones.map((z) => {
            const pct = z.total > 0 ? Math.min(100, Math.round((z.booked / z.total) * 100)) : 0;
            const barColor = zoneColors[z.key] || "#3B82F6";
            const remaining = Math.max(0, z.total - z.booked);

            return (
              <div key={z.key} className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between text-sm font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full inline-block" 
                      style={{ backgroundColor: barColor }} 
                    />
                    <span>โซน {z.key} ({z.name}) - ฿{z.price.toLocaleString()}/ล็อค</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 sm:mt-0">
                    จองแล้ว {z.booked} / {z.total} ล็อค <span className="text-emerald-600 ml-1">(ว่าง {remaining})</span>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>อัตราการจอง: {pct}%</span>
                  <span>คาดการณ์ยอดโซนนี้: ฿{(z.total * z.price).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
