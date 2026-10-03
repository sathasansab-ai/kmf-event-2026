"use client";

import { useState } from "react";

interface Vendor {
  id: string;
  timestamp: string;
  shopName: string;
  ownerName: string;
  phone: string;
  lineId: string;
  zone: string;
  category: string;
  boothCount: number;
  totalDeposit: number;
  totalFull: number;
  slipUrl: string;
  status: "รอตรวจสอบ" | "อนุมัติแล้ว" | "ปฏิเสธ";
}

const initialVendors: Vendor[] = [
  {
    id: "V-001",
    timestamp: "02/10/2569 14:32",
    shopName: "ร้านปลาหมึกย่างนาย ก.",
    ownerName: "สมชาย มีโชค",
    phone: "081-234-5678",
    lineId: "somchai_sq",
    zone: "A",
    category: "ของทานเล่น",
    boothCount: 1,
    totalDeposit: 1750,
    totalFull: 3500,
    slipUrl: "#",
    status: "รอตรวจสอบ",
  },
  {
    id: "V-002",
    timestamp: "02/10/2569 13:10",
    shopName: "ร้านถ่ายภาพวินเทจ 1990",
    ownerName: "วิภาดา สดใส",
    phone: "089-876-5432",
    lineId: "vipada_photo",
    zone: "B",
    category: "ร้านถ่ายภาพ",
    boothCount: 1,
    totalDeposit: 1250,
    totalFull: 2500,
    slipUrl: "#",
    status: "อนุมัติแล้ว",
  },
  {
    id: "V-003",
    timestamp: "02/10/2569 11:45",
    shopName: "กาแฟ Food Truck บึงหัวทะเล",
    ownerName: "ธนกร มุ่งมั่น",
    phone: "092-333-4455",
    lineId: "tanakorn_coffee",
    zone: "D",
    category: "รถ Food Truck เครื่องดื่ม",
    boothCount: 1,
    totalDeposit: 2000,
    totalFull: 4000,
    slipUrl: "#",
    status: "อนุมัติแล้ว",
  },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [filterZone, setFilterZone] = useState("ALL");
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  const filtered = filterZone === "ALL" 
    ? vendors 
    : vendors.filter(v => v.zone === filterZone);

  const updateStatus = (id: string, newStatus: "อนุมัติแล้ว" | "ปฏิเสธ") => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Title & Quick Links */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            🏪 ร้านค้าที่สมัคร & ตรวจสอบสลิป
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            รายการร้านค้าทั้งหมด ข้อมูลจะถูกซิงค์ไปยัง Google Sheets และสลิปจะแยกโฟลเดอร์ใน Google Drive
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-2 rounded-xl text-xs border border-blue-200 transition"
          >
            <span>📁</span> เปิด Google Drive
          </a>
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-4 py-2 rounded-xl text-xs border border-emerald-200 transition"
          >
            <span>📊</span> เปิด Google Sheets
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["ALL", "A", "B", "C", "D"].map(z => (
          <button
            key={z}
            onClick={() => setFilterZone(z)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterZone === z 
                ? "bg-slate-900 text-white shadow" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {z === "ALL" ? "ทั้งหมด" : `โซน ${z}`}
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">เวลาสมัคร</th>
                <th className="p-4">ชื่อร้าน</th>
                <th className="p-4">ผู้ติดต่อ / โทร / Line</th>
                <th className="p-4">โซน & ประเภท</th>
                <th className="p-4">จำนวน</th>
                <th className="p-4">มัดจำ (50%)</th>
                <th className="p-4">สลิปโอนเงิน</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4 text-center">จัดการ</th>
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
                  </td>
                  <td className="p-4 text-xs">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mr-1">Zone {v.zone}</span>
                    <span className="text-slate-500">{v.category}</span>
                  </td>
                  <td className="p-4 font-bold text-center">{v.boothCount}</td>
                  <td className="p-4 font-bold text-rose-600">฿{v.totalDeposit.toLocaleString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedSlip(v.shopName)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1"
                    >
                      <span>📎</span> ดูสลิป
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      v.status === "อนุมัติแล้ว"
                        ? "bg-emerald-100 text-emerald-800"
                        : v.status === "ปฏิเสธ"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {v.status === "รอตรวจสอบ" ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => updateStatus(v.id, "อนุมัติแล้ว")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                        >
                          ✓ อนุมัติ
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, "ปฏิเสธ")}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm"
                        >
                          ✕ ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal Preview */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg">หลักฐานการโอนเงิน</h3>
            <p className="text-xs text-slate-500">ร้าน: {selectedSlip}</p>
            <div className="w-full h-72 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50">
              <div className="text-center text-slate-400">
                <span className="text-4xl">🧾</span>
                <p className="text-xs mt-2 font-semibold">ไฟล์สลิปถูกเก็บแยกโฟลเดอร์ใน Google Drive:<br/><span className="text-blue-600 font-bold">/Google Drive/KMF/{selectedSlip}/</span></p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSlip(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
