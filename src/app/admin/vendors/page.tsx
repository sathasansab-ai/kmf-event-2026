"use client";

import { useState, useEffect } from "react";

interface Vendor {
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
  benefits?: string;
  referrer?: string;
  status: "รอตรวจสอบ" | "อนุมัติแล้ว" | "ปฏิเสธ";
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filterZone, setFilterZone] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.vendors)) {
        const formatted: Vendor[] = data.vendors.map((v: any) => ({
          ...v,
          status: "อนุมัติแล้ว",
        }));
        setVendors(formatted);
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = filterZone === "ALL" 
    ? vendors 
    : vendors.filter(v => v.zone === filterZone);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Title & Quick Links */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            🏪 ร้านค้าที่สมัคร &amp; ตรวจสอบสลิป
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            รายการร้านค้าทั้งหมดดึงตรงจาก Google Sheets แบบเรียลไทม์ พร้อมลิงก์เปิดดูสลิปใน Google Drive
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchVendors}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
          >
            <span className={isLoading ? "animate-spin" : ""}>🔄</span>
            {isLoading ? "กำลังดึงข้อมูล..." : "รีเฟรชข้อมูล"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["ALL", "A", "B", "C", "D"].map(z => (
          <button
            key={z}
            onClick={() => setFilterZone(z)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterZone === z 
                ? "bg-slate-900 text-white shadow" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {z === "ALL" ? `ทั้งหมด (${vendors.length})` : `โซน ${z} (${vendors.filter(v => v.zone === z).length})`}
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <span className="text-4xl block mb-2">📭</span>
            {isLoading ? "กำลังโหลดข้อมูลจาก Google Sheets..." : "ไม่พบข้อมูลร้านค้าในโซนที่เลือก"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">เวลาสมัคร</th>
                  <th className="p-4">ชื่อร้าน</th>
                  <th className="p-4">ผู้ติดต่อ / โทร / Line</th>
                  <th className="p-4">โซน &amp; ประเภท</th>
                  <th className="p-4 text-center">จำนวนล็อค</th>
                  <th className="p-4 text-right">มัดจำ (50%)</th>
                  <th className="p-4 text-center">สลิปโอนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{v.timestamp}</td>
                    <td className="p-4 font-bold text-slate-900">{v.shopName}</td>
                    <td className="p-4 text-xs space-y-0.5">
                      <div className="font-semibold text-slate-800">{v.ownerName}</div>
                      <div className="text-slate-500">📞 {v.phone}</div>
                      <div className="text-blue-600">💬 {v.lineId}</div>
                      {v.referrer && v.referrer !== "ไม่มี" && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold inline-block mt-0.5">
                          🤝 แนะนำโดย: {v.referrer}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Zone {v.zone}</span>
                        <span className="text-slate-500">{v.category}</span>
                      </div>
                      {v.benefits && v.benefits !== "-" && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block max-w-[200px] truncate" title={v.benefits}>
                          🎁 {v.benefits}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-center">{v.boothCount}</td>
                    <td className="p-4 font-bold text-rose-600 text-right">฿{v.totalDeposit.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {v.slipUrl && v.slipUrl.startsWith("http") ? (
                        <a
                          href={v.slipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1 shadow-sm transition"
                        >
                          <span>🔍</span> ดูสลิป (Drive)
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">ไม่มีสลิป</span>
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
