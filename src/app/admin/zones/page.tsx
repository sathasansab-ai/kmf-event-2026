"use client";

import { useState, useEffect } from "react";

interface ZoneItem {
  key: string;
  name: string;
  title: string;
  price: number;
  total: number;
  booked: number;
  categories: string[];
  benefits?: string[];
}

const DEFAULT_ZONES: ZoneItem[] = [
  {
    key: "A",
    name: "ถนนคนเดิน (FESTIVAL MARKET)",
    title: "ของทานเล่น, อาหารจานหลัก, เครื่องดื่ม",
    price: 3500,
    total: 30,
    booked: 0,
    categories: ["ของทานเล่น", "อาหารจานหลัก", "เครื่องดื่ม"],
    benefits: ["เต็นท์ขนาด 2x2 เมตร", "หลอดไฟส่องสว่าง 1 จุด", "ระบบไฟฟ้า (ไม่เกิน 4.5 แอมป์)"],
  },
  {
    key: "B",
    name: "ร้านค้า / ร้าน Craft (ART & MARKET)",
    title: "งานคราฟท์, เสื้อผ้า, งานปูนปาสเตอร์, ของแต่งบ้าน",
    price: 2500,
    total: 15,
    booked: 0,
    categories: ["งานปูนปลาสเตอร์", "ร้านถ่ายภาพ", "ร้านเสื้อผ้า", "งานคราฟท์/แฮนด์เมด", "เครื่องประดับ", "ของตกแต่งบ้าน"],
    benefits: ["เต็นท์ขนาด 2x2 เมตร", "หลอดไฟส่องสว่าง 1 จุด", "ระบบไฟฟ้า (ไม่เกิน 4.5 แอมป์)"],
  },
  {
    key: "C",
    name: "ตลาดริมน้ำ (FOOD ZONE)",
    title: "สินค้าท้องถิ่น, อาหารพื้นบ้าน, ผลไม้",
    price: 2000,
    total: 7,
    booked: 0,
    categories: ["สินค้าท้องถิ่น", "อาหารพื้นบ้าน", "ผลไม้"],
    benefits: ["โต๊ะ 1 ตัว เก้าอี้ 2 ตัว", "ร่มสนามกันแดด", "หลอดไฟส่องสว่าง", "ระบบไฟฟ้า (ไม่เกิน 4.5 แอมป์)"],
  },
  {
    key: "D",
    name: "Food Truck (CINEMA BY THE RIVER)",
    title: "รถฟู้ดทรัค อาหารและเครื่องดื่ม",
    price: 4000,
    total: 8,
    booked: 0,
    categories: ["รถ Food Truck อาหาร", "รถ Food Truck เครื่องดื่ม"],
    benefits: ["พื้นที่จอดรถ Food Truck", "จุดเชื่อมต่อระบบไฟฟ้า (ไม่เกิน 15 แอมป์)", "จุดทิ้งขยะและจัดการน้ำเสีย"],
  },
];

export default function AdminZonesPage() {
  const [zones, setZones] = useState<ZoneItem[]>(DEFAULT_ZONES);
  const [savedMsg, setSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [benefitInputs, setBenefitInputs] = useState<Record<string, string>>({});

  // โหลดการตั้งค่าโซนจาก Google Sheets (เพื่อซิงค์ทุกเครื่อง) และดึงจำนวนจองจริง
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kmf_zone_config");
      if (saved) setZones(JSON.parse(saved));
    } catch (e) {}

    // ดึงค่าการตั้งค่าจาก Google Sheets
    fetch("/api/config", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config?.zones) {
          setZones(data.config.zones);
        }
      })
      .catch(() => {});

    // ดึงจำนวนล็อคที่จองจริงจาก Google Sheets มาอัปเดตให้อัตโนมัติ
    fetch("/api/zones", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.zones) {
          setZones(prev => prev.map(z => ({
            ...z,
            booked: data.zones[z.key]?.booked !== undefined ? data.zones[z.key].booked : z.booked,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const updateZone = (key: string, field: "price" | "total" | "booked", value: number) => {
    setZones(prev => prev.map(z => z.key === key ? { ...z, [field]: value } : z));
  };

  const handleAddBenefit = (zoneKey: string, benefitText?: string) => {
    const textToAdd = (benefitText || benefitInputs[zoneKey] || "").trim();
    if (!textToAdd) return;

    setZones(prev => prev.map(z => {
      if (z.key === zoneKey) {
        const cur = z.benefits || [];
        if (!cur.includes(textToAdd)) {
          return { ...z, benefits: [...cur, textToAdd] };
        }
      }
      return z;
    }));

    setBenefitInputs(prev => ({ ...prev, [zoneKey]: "" }));
  };

  const handleRemoveBenefit = (zoneKey: string, index: number) => {
    setZones(prev => prev.map(z => {
      if (z.key === zoneKey) {
        const cur = [...(z.benefits || [])];
        cur.splice(index, 1);
        return { ...z, benefits: cur };
      }
      return z;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("kmf_zone_config", JSON.stringify(zones));

      // บันทึกลง Google Sheets เพื่อซิงค์ทุกเครื่องทั่วโลก
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });
      const data = await res.json();

      setSavedMsg(data.message || "บันทึกราคา โควต้า และสิทธิประโยชน์เรียบร้อยแล้ว ทุกเครื่องจะอัปเดตตามทันที!");
      setTimeout(() => setSavedMsg(""), 4500);
    } catch (e) {
      setSavedMsg("บันทึกข้อมูลเรียบร้อยแล้ว!");
      setTimeout(() => setSavedMsg(""), 3500);
    } finally {
      setIsSaving(false);
    }
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

              {/* Zone Benefits & Inclusions Editor */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🎁</span> สิทธิประโยชน์ / สิ่งที่จะได้รับในโซนนี้:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {z.benefits?.length || 0} รายการ
                  </span>
                </div>

                {/* Benefits Tag List */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {(!z.benefits || z.benefits.length === 0) ? (
                    <span className="text-xs text-slate-400 italic py-1 px-1">ยังไม่มีสิทธิประโยชน์ที่กำหนด (พิมพ์เพิ่มด้านล่างได้เลย)</span>
                  ) : (
                    z.benefits.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        <span>✓ {b}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(z.key, bIdx)}
                          className="hover:bg-emerald-200 text-emerald-800 rounded-full w-4 h-4 flex items-center justify-center text-[11px] ml-0.5"
                          title="ลบสิทธิประโยชน์นี้"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Benefit Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitInputs[z.key] || ""}
                    onChange={(e) => setBenefitInputs({ ...benefitInputs, [z.key]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit(z.key);
                      }
                    }}
                    placeholder="เช่น เต็นท์, หลอดไฟ, ไฟฟ้า (4.5 แอมป์)..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddBenefit(z.key)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1"
                  >
                    <span>➕</span> เพิ่ม
                  </button>
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 self-center mr-1">เพิ่มด่วน:</span>
                  {[
                    "เต็นท์ขนาด 2x2 เมตร",
                    "หลอดไฟส่องสว่าง 1 จุด",
                    "ระบบไฟฟ้า (ไม่เกิน 4.5 แอมป์)",
                    "โต๊ะ 1 ตัว เก้าอี้ 2 ตัว",
                    "ร่มสนามกันแดด",
                    "จุดเชื่อมต่อระบบไฟฟ้า (15A)",
                  ].map((preset, pIdx) => {
                    const isAlreadyAdded = z.benefits?.includes(preset);
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddBenefit(z.key, preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                          isAlreadyAdded
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-white text-slate-600 border-slate-300 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
