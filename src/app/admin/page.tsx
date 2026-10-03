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

interface VendorItem {
  id: string;
  timestamp: string;
  shopName: string;
  ownerName: string;
  phone: string;
  lineId: string;
  zone: string;
  zoneName: string;
  category: string;
  boothCount: number;
  totalDeposit: number;
  totalFull: number;
  slipUrl: string;
}

const DEFAULT_ZONES: ZoneItem[] = [
  { key: "A", name: "ถนนคนเดิน (FESTIVAL MARKET)", title: "ของทานเล่น, อาหารจานหลัก, เครื่องดื่ม", price: 3500, total: 30, booked: 0 },
  { key: "B", name: "ร้านค้า / ร้าน Craft (ART & MARKET)", title: "งานคราฟท์, เสื้อผ้า, งานปูนปาสเตอร์, ของแต่งบ้าน", price: 2500, total: 15, booked: 0 },
  { key: "C", name: "ตลาดริมน้ำ (FOOD ZONE)", title: "สินค้าท้องถิ่น, อาหารพื้นบ้าน, ผลไม้", price: 2000, total: 7, booked: 0 },
  { key: "D", name: "Food Truck (CINEMA BY THE RIVER)", title: "รถฟู้ดทรัค อาหารและเครื่องดื่ม", price: 4000, total: 8, booked: 0 },
];

export default function AdminDashboard() {
  const [zones, setZones] = useState<ZoneItem[]>(DEFAULT_ZONES);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshToast, setRefreshToast] = useState("");
  const [googleStats, setGoogleStats] = useState({
    totalVendors: 0,
    totalBooked: 0,
    totalDeposit: 0,
    totalFull: 0,
  });

  const fetchData = async () => {
    setIsLoading(true);
    setApiError("");
    let currentZones = DEFAULT_ZONES;

    // 1. โหลดการตั้งค่าราคาและจำนวนล็อคจาก localStorage
    try {
      const saved = localStorage.getItem("kmf_zone_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentZones = parsed;
        }
      }
    } catch (e) {}

    // 2. ดึงข้อมูลสดแบบ Real-time จาก Google Sheets ผ่าน API
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.stats) {
        setIsGoogleConnected(true);
        if (data.sheetTitle) setSheetTitle(data.sheetTitle);
        setGoogleStats(data.stats);
        setVendors(data.vendors || []);

        // นำจำนวนล็อคที่จองจริงจาก Google Sheet มาอัปเดตในแต่ละโซน
        const zoneCounts = data.stats.zoneBooked || {};
        const updatedZones = currentZones.map(z => ({
          ...z,
          booked: zoneCounts[z.key] !== undefined ? zoneCounts[z.key] : z.booked,
        }));
        setZones(updatedZones);
      } else {
        if (data.error) setApiError(data.error);
        setZones(currentZones);
      }
    } catch (err: any) {
      setApiError(err?.message || "ไม่สามารถติดต่อ API ได้");
      setZones(currentZones);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    await fetchData();
    setRefreshToast("✓ ซิงค์และรีเฟรชข้อมูลล่าสุดจาก Google Sheets เรียบร้อยแล้ว");
    setTimeout(() => setRefreshToast(""), 3500);
  };

  const totalBooths = zones.reduce((sum, z) => sum + (Number(z.total) || 0), 0);
  const totalBookedFromSheet = googleStats.totalBooked || zones.reduce((sum, z) => sum + (Number(z.booked) || 0), 0);
  const availableBooths = Math.max(0, totalBooths - totalBookedFromSheet);
  const totalDeposit = googleStats.totalDeposit || zones.reduce((sum, z) => sum + ((Number(z.booked) || 0) * (Number(z.price) || 0) / 2), 0);
  const projectedRevenue = zones.reduce((sum, z) => sum + ((Number(z.total) || 0) * (Number(z.price) || 0)), 0);

  const zoneColors: Record<string, string> = {
    A: "#F2A11B",
    B: "#1F5B5A",
    C: "#C94232",
    D: "#3B82F6",
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900">ภาพรวมระบบ (Dashboard)</h1>
            {isGoogleConnected ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Google Sheets {sheetTitle ? `(${sheetTitle})` : ""}
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                โหมดออฟไลน์
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ข้อมูลอัปเดตอัตโนมัติ ซิงค์ตรงกับ Google Sheets และการตั้งค่าโซน
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="bg-[#1B1B1B] hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className={isLoading ? "animate-spin" : ""}>🔄</span>
          {isLoading ? "กำลังโหลดข้อมูล..." : "รีเฟรชข้อมูล (ดึงจาก Sheet)"}
        </button>
      </div>

      {apiError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium p-3.5 rounded-xl">
          ⚠️ <strong>การเชื่อมต่อ Google Sheets:</strong> {apiError}
        </div>
      )}

      {refreshToast && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold px-4 py-3 rounded-xl shadow-sm animate-pulse">
          {refreshToast}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* จำนวนร้านค้าที่สมัคร */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">ร้านค้าที่สมัครแล้ว</div>
          <div className="text-3xl font-extrabold text-gray-900">
            {googleStats.totalVendors} <span className="text-sm font-normal text-gray-500">ร้าน</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-2.5 py-1 rounded-lg">
            จองแล้วรวม {totalBookedFromSheet} ล็อค
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

        {/* ยอดเงินมัดจำจริงจาก Google Sheets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
          <div className="text-gray-500 text-sm font-medium mb-1">ยอดเงินมัดจำ (ที่ได้รับ)</div>
          <div className="text-3xl font-extrabold text-[#C94232]">
            ฿{totalDeposit.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-gray-500">
            คำนวณจากสลิปมัดจำ 50%
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
          <h2 className="text-xl font-bold text-gray-800">สถานะพื้นที่แต่ละโซน (Real-time)</h2>
          <Link 
            href="/admin/zones" 
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ✏️ ปรับจำนวน &amp; ราคาโซน
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

      {/* Recent Vendors from Google Sheets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              📋 รายชื่อร้านค้าที่สมัครล่าสุด (จาก Google Sheets)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              แสดงรายการที่บันทึกลง Google Sheet แบบเรียลไทม์ พร้อมปุ่มเปิดดูรูปสลิป
            </p>
          </div>
          <Link 
            href="/admin/vendors" 
            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            ดูทั้งหมด ({vendors.length} ร้าน) ➔
          </Link>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            <span className="text-3xl block mb-2">📭</span>
            ยังไม่มีร้านค้าสมัครเข้ามา ข้อมูลจะปรากฏที่นี่ทันทีเมื่อมีคนส่งแบบฟอร์ม
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b text-xs">
                <tr>
                  <th className="py-3 px-4">เวลาสมัคร</th>
                  <th className="py-3 px-4">ชื่อร้านค้า</th>
                  <th className="py-3 px-4">ผู้สมัคร / เบอร์โทร</th>
                  <th className="py-3 px-4">โซน</th>
                  <th className="py-3 px-4 text-center">จำนวนล็อค</th>
                  <th className="py-3 px-4 text-right">ยอดมัดจำ</th>
                  <th className="py-3 px-4 text-center">สลิปโอนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.slice(0, 10).map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">{v.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{v.shopName}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div>{v.ownerName}</div>
                      <div className="text-gray-400">{v.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        โซน {v.zone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">{v.boothCount}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#C94232]">
                      ฿{v.totalDeposit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {v.slipUrl && v.slipUrl.startsWith("http") ? (
                        <a 
                          href={v.slipUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
                        >
                          <span>🔍</span> ดูสลิป
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
