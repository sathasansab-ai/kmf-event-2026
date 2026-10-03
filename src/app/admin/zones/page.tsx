"use client";

import { useState } from "react";

interface ZoneItem {
  key: string;
  name: string;
  title: string;
  price: number;
  total: number;
  booked: number;
  categories: string[];
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<ZoneItem[]>([
    {
      key: "A",
      name: "ถนนคนเดิน (FESTIVAL MARKET)",
      title: "ของทานเล่น, อาหารจานหลัก, เครื่องดื่ม",
      price: 3500,
      total: 30,
      booked: 11,
      categories: ["ของทานเล่น", "อาหารจานหลัก", "เครื่องดื่ม"],
    },
    {
      key: "B",
      name: "ร้านค้า / ร้าน Craft (ART & MARKET)",
      title: "งานคราฟท์, เสื้อผ้า, งานปูนปาสเตอร์, ของแต่งบ้าน",
      price: 2500,
      total: 15,
      booked: 3,
      categories: ["งานปูนปลาสเตอร์", "ร้านถ่ายภาพ", "ร้านเสื้อผ้า", "งานคราฟท์/แฮนด์เมด", "เครื่องประดับ", "ของตกแต่งบ้าน"],
    },
    {
      key: "C",
      name: "ตลาดริมน้ำ (FOOD ZONE)",
      title: "สินค้าท้องถิ่น, อาหารพื้นบ้าน, ผลไม้",
      price: 2000,
      total: 7,
      booked: 2,
      categories: ["สินค้าท้องถิ่น", "อาหารพื้นบ้าน", "ผลไม้"],
    },
    {
      key: "D",
      name: "Food Truck (CINEMA BY THE RIVER)",
      title: "รถฟู้ดทรัค อาหารและเครื่องดื่ม",
      price: 4000,
      total: 8,
      booked: 0,
      categories: ["รถ Food Truck อาหาร", "รถ Food Truck เครื่องดื่ม"],
    },
  ]);

  const [savedMsg, setSavedMsg] = useState("");

  const updateZone = (key: string, field: "price" | "total" | "booked", value: number) => {
    setZones(prev => prev.map(z => z.key === key ? { ...z, [field]: value } : z));
  };

  const handleSave = () => {
    setSavedMsg("บันทึกราคาและจำนวนล็อคเรียบร้อยแล้ว!");
    setTimeout(() => setSavedMsg(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">
            📍 จัดการโซน, จำนวนล็อค & ราคา
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ปรับเปลี่ยนราคาต่อล็อค เพิ่ม-ลดโควต้าจำนวนล็อคที่เปิดรับ และระบบจะคำนวณจำนวนที่เหลือให้อัตโนมัติ
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition flex items-center gap-2 self-start"
        >
          <span>💾</span> บันทึกการเปลี่ยนแปลง
        </button>
      </div>

      {savedMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-bold p-4 rounded-2xl shadow-sm animate-pulse">
          ✅ {savedMsg}
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map(z => {
          const remaining = Math.max(0, z.total - z.booked);
          return (
            <div key={z.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-lg">
                    {z.key}
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">{z.name}</h2>
                    <p className="text-xs text-slate-400">{z.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    remaining <= 3 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    เหลือ {remaining} ล็อค
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    💰 ราคาต่อล็อค (฿)
                  </label>
                  <input
                    type="number"
                    value={z.price}
                    onChange={(e) => updateZone(z.key, "price", parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-blue-700 focus:border-blue-600 outline-none"
                  />
                  <span className="text-[11px] text-slate-400">มัดจำ: ฿{(z.price / 2).toLocaleString()}</span>
                </div>

                {/* Total Slots */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    🎪 รับทั้งหมด (ล็อค)
                  </label>
                  <input
                    type="number"
                    value={z.total}
                    onChange={(e) => updateZone(z.key, "total", parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-800 focus:border-blue-600 outline-none"
                  />
                  <span className="text-[11px] text-slate-400">โควต้าเปิดรับ</span>
                </div>

                {/* Booked Slots */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    👥 จองแล้ว (ล็อค)
                  </label>
                  <input
                    type="number"
                    value={z.booked}
                    onChange={(e) => updateZone(z.key, "booked", parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold text-rose-600 focus:border-blue-600 outline-none"
                  />
                  <span className="text-[11px] text-slate-400">ร้านค้าที่จองแล้ว</span>
                </div>

              </div>

              {/* Calculation Preview */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  หน้าผู้สมัครจะแสดง: <strong className="text-emerald-700">"ว่าง {remaining} ล็อค"</strong>
                </span>
                <span className="text-slate-500">
                  คาดการณ์รายได้โซนนี้: <strong className="text-slate-800 font-bold">฿{(z.total * z.price).toLocaleString()}</strong>
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
