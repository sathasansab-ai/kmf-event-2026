"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState<"qr" | "bank">("qr");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kmf_site_config");
      if (saved) setSiteConfig(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    shopName: "",
    phone: "",
    lineId: "",
    zone: "",
    category: "",
    boothCount: 1,
    slip: null as File | null,
  });

  const zones = {
    A: { 
      name: "โซน A (ถนนคนเดิน - FESTIVAL MARKET)", 
      price: 3500, 
      remaining: 19,
      mapDesc: "พื้นที่ริมถนนคนเดินสายหลัก ใกล้เวทีกลาง มีคนเดินผ่านตลอดทั้งคืน",
      color: "bg-orange-500"
    },
    B: { 
      name: "โซน B (ร้านค้า , ร้าน Craft - ART & MARKET)", 
      price: 2500, 
      remaining: 12,
      mapDesc: "พื้นที่ลานคราฟท์และต้นไม้ใหญ่ บรรยากาศอบอุ่น สไตล์วินเทจ",
      color: "bg-blue-500"
    },
    C: { 
      name: "โซน C (ตลาดริมน้ำ - FOOD ZONE)", 
      price: 2000, 
      remaining: 5,
      mapDesc: "พื้นที่เลียบระเบียงริมน้ำบึงหัวทะเล เหมาะสำหรับอาหารและเครื่องดื่มชิลๆ",
      color: "bg-teal-500"
    },
    D: { 
      name: "โซน D (Food Truck - CINEMA BY THE RIVER)", 
      price: 4000, 
      remaining: 8,
      mapDesc: "ลานจอดรถ Food Truck กว้างขวาง ด้านหน้าจอหนังกลางแปลงริมน้ำ",
      color: "bg-rose-500"
    },
  };

  const categories = {
    A: ["ของทานเล่น", "อาหารจานหลัก", "เครื่องดื่ม"],
    B: ["งานปูนปลาสเตอร์", "ร้านถ่ายภาพ", "ร้านเสื้อผ้า", "งานคราฟท์/แฮนด์เมด", "เครื่องประดับ", "ของตกแต่งบ้าน"],
    C: ["สินค้าท้องถิ่น", "อาหารพื้นบ้าน", "ผลไม้"],
    D: ["รถ Food Truck อาหาร", "รถ Food Truck เครื่องดื่ม"],
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, slip: e.target.files[0] });
      setSubmitError("");
    }
  };

  const calculateTotal = () => {
    if (!formData.zone) return 0;
    const pricePerBooth = zones[formData.zone as keyof typeof zones].price;
    return pricePerBooth * formData.boothCount;
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!formData.slip) {
      setSubmitError("กรุณาแนบภาพสลิปหลักฐานการโอนเงินก่อนส่งใบสมัคร");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("shopName", formData.shopName);
      data.append("phone", formData.phone);
      data.append("lineId", formData.lineId);
      data.append("zone", formData.zone);
      data.append("zoneName", zones[formData.zone as keyof typeof zones]?.name || "");
      data.append("category", formData.category);
      data.append("boothCount", String(formData.boothCount));
      data.append("totalFull", String(calculateTotal()));
      data.append("totalDeposit", String(calculateTotal() / 2));
      data.append("slip", formData.slip);

      const res = await fetch("/api/submit-vendor", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึก");

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 py-16 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto">
            ✓
          </div>
          <h1 className="text-2xl font-black text-slate-800">ส่งใบสมัครสำเร็จแล้ว!</h1>
          <p className="text-sm font-bold text-blue-700 bg-blue-50 py-2 px-4 rounded-xl">
            ร้าน: {formData.shopName}
          </p>
          <div className="text-xs text-slate-500 space-y-1 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div><strong>ผู้สมัคร:</strong> {formData.firstName} {formData.lastName}</div>
            <div><strong>เบอร์โทร:</strong> {formData.phone}</div>
            <div><strong>Line ID:</strong> {formData.lineId}</div>
            <div><strong>โซนที่จอง:</strong> {zones[formData.zone as keyof typeof zones]?.name} ({formData.boothCount} ล็อค)</div>
            <div><strong>ยอดมัดจำ:</strong> ฿{(calculateTotal() / 2).toLocaleString()} บาท</div>
            <div><strong>การเก็บข้อมูล:</strong> ส่งไปยัง Google Sheets และเก็บสลิปในโฟลเดอร์ Google Drive ชื่อร้านเรียบร้อย</div>
          </div>
          <p className="text-xs text-slate-400">
            ทีมงานจะตรวจสอบสลิปการโอนเงินและดึงเข้ากลุ่ม Line ภายใน 24 ชม.
          </p>
          <Link
            href="/"
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 font-sans text-slate-900">
      
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Progress */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
            ✨ แบบฟอร์มสมัครร้านค้า ✨
          </h1>
          <p className="text-blue-100 mt-1 text-sm font-medium">
            Korat Movie Festival 2026 (เทศกาลหนังเมืองโคราช)
          </p>
          
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 bg-black/30 p-2 rounded-full backdrop-blur-md">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${step >= 1 ? "bg-white text-blue-700 shadow-md" : "text-white/70"}`}>1. ข้อมูล</span>
              <span className="text-white/50">›</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${step >= 2 ? "bg-white text-blue-700 shadow-md" : "text-white/70"}`}>2. เลือกโซน</span>
              <span className="text-white/50">›</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${step >= 3 ? "bg-white text-blue-700 shadow-md" : "text-white/70"}`}>3. ชำระเงิน</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          
          {/* Step 1: ข้อมูลส่วนตัว */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-xl text-lg">👤</span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">ข้อมูลผู้สมัคร</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อ <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} 
                    className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" 
                    placeholder="ระบุชื่อจริง" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">นามสกุล <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} 
                    className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" 
                    placeholder="ระบุนามสกุล" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อร้านค้า (ที่จะใช้ติดป้ายงาน) <span className="text-red-500">*</span></label>
                <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} 
                  className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" 
                  placeholder="เช่น แซ่บอีลี่, ปลาหมึกย่างนาย ก." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                    className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" 
                    placeholder="08X-XXX-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Line ID <span className="text-red-500">*</span></label>
                  <input type="text" name="lineId" value={formData.lineId} onChange={handleInputChange} 
                    className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-slate-50 focus:bg-white placeholder-slate-400" 
                    placeholder="Line ID สำหรับดึงเข้ากลุ่ม" />
                </div>
              </div>
              <button 
                onClick={nextStep}
                disabled={!formData.firstName || !formData.lastName || !formData.shopName || !formData.phone || !formData.lineId}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl mt-8 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ดำเนินการต่อ ➔
              </button>
            </div>
          )}

          {/* Step 2: เลือกโซน */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-xl text-lg">📍</span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">เลือกพื้นที่จำหน่ายสินค้า</h2>
              </div>

              {/* Master Map Banner */}
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-blue-900">🗺️ ผังพื้นที่จัดงานรวม (14 โซน)</h3>
                  <p className="text-xs text-blue-700 mt-0.5">ตลาดน้ำบึงหัวทะเล โคราช</p>
                </div>
                <span className="text-xs bg-white text-blue-800 font-bold px-3 py-1.5 rounded-lg border border-blue-200">
                  ผังงานภาพรวม
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">คลิกเลือกโซนที่ต้องการ</label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(zones).map(([key, zone]) => (
                    <label key={key} className={`border-2 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all ${formData.zone === key ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                      
                      <div className="flex items-center">
                        <input type="radio" name="zone" value={key} checked={formData.zone === key} onChange={handleInputChange} className="mr-3 w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-extrabold text-slate-900 text-base md:text-lg">{zone.name}</div>
                          <div className="text-sm font-bold text-blue-700 bg-blue-100 inline-block px-2.5 py-0.5 rounded-lg mt-1">฿{zone.price.toLocaleString()} / ล็อค</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ว่าง {zone.remaining}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selected Zone Location Map Preview */}
              {formData.zone && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-blue-900">📍 ตำแหน่งและผังเฉพาะของโซน {formData.zone}</span>
                    <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded">แผนผังโซน</span>
                  </div>
                  <div className="min-h-[140px] border-2 border-dashed border-blue-300 rounded-xl bg-white flex items-center justify-center text-center p-4">
                    {siteConfig?.zoneMaps?.[formData.zone] ? (
                      <img src={siteConfig.zoneMaps[formData.zone]} alt={`Zone ${formData.zone}`} className="max-h-56 object-contain rounded-lg" />
                    ) : (
                      <div className="text-slate-500 text-xs">
                        <span className="text-2xl block mb-1">🗺️</span>
                        <strong className="text-blue-900 text-sm">{zones[formData.zone as keyof typeof zones]?.name}</strong>
                        <p className="text-slate-500 mt-1">{zones[formData.zone as keyof typeof zones]?.mapDesc}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.zone && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">ประเภทสินค้า <span className="text-red-500">*</span></label>
                      <select name="category" value={formData.category} onChange={handleInputChange} 
                        className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-white cursor-pointer">
                        <option value="">-- เลือกประเภท --</option>
                        {categories[formData.zone as keyof typeof categories].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนล็อคที่ต้องการ (สูงสุด 5)</label>
                      <input type="number" name="boothCount" min="1" max="5" value={formData.boothCount} onChange={handleInputChange} 
                        className="w-full border-2 border-slate-300 rounded-xl p-3 text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none bg-white text-center text-lg" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 mt-8">
                <button onClick={prevStep} className="w-1/3 bg-white border-2 border-slate-300 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all">ย้อนกลับ</button>
                <button onClick={nextStep} disabled={!formData.zone || !formData.category} 
                  className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  ดูสรุปยอดชำระเงิน ➔
                </button>
              </div>
            </div>
          )}

          {/* Step 3: ชำระเงิน */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <span className="bg-green-100 text-green-600 p-2 rounded-xl text-lg">💳</span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">สรุปรายการและชำระเงิน</h2>
              </div>
              
              {/* Order Summary */}
              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-300 border-dashed">
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-800">{formData.shopName || "-"}</h3>
                    <p className="text-sm text-slate-500">โดยคุณ {formData.firstName} {formData.lastName}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Zone {formData.zone}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6 text-slate-700 font-medium text-sm">
                  <div className="flex justify-between"><span>ประเภทสินค้า:</span> <span>{formData.category}</span></div>
                  <div className="flex justify-between"><span>พื้นที่:</span> <span>{zones[formData.zone as keyof typeof zones]?.name}</span></div>
                  <div className="flex justify-between"><span>จำนวน:</span> <span>{formData.boothCount} ล็อค</span></div>
                  <div className="flex justify-between"><span>ราคาต่อล็อค:</span> <span>฿{zones[formData.zone as keyof typeof zones]?.price.toLocaleString()}</span></div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-400 line-through mb-1 font-medium">
                    <span>ราคาเต็มรวม</span>
                    <span>฿{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-2xl text-red-600">
                    <span>ยอดมัดจำ (50%)</span>
                    <span>฿{(calculateTotal() / 2).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 text-right mt-1">*ส่วนที่เหลือ ฿{(calculateTotal() / 2).toLocaleString()} ชำระในวันจัดงาน</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลือกวิธีชำระเงินมัดจำ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod("qr")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                      payMethod === "qr" 
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    📱 1. สแกน QR PromptPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("bank")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                      payMethod === "bank" 
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    🏦 2. โอนผ่านเลขที่บัญชี
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 text-center">
                {payMethod === "qr" ? (
                  <div>
                    <p className="font-extrabold text-blue-900 mb-3 text-lg">สแกน QR Code เพื่อชำระเงินมัดจำ</p>
                    <div className="w-56 h-56 bg-white mx-auto flex items-center justify-center border-4 border-white shadow-lg rounded-2xl p-2">
                      {siteConfig?.qrCode ? (
                        <img src={siteConfig.qrCode} alt="PromptPay QR Code" className="w-full h-full object-contain rounded-xl" />
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center flex-col text-slate-400">
                          <span className="text-3xl mb-2">📱</span>
                          <span className="text-sm font-bold text-slate-700">QR Code พร้อมเพย์</span>
                          <span className="text-sm text-red-600 font-extrabold mt-1">฿{(calculateTotal() / 2).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-xs font-medium text-blue-900 bg-white inline-block px-4 py-2 rounded-xl shadow-sm border border-blue-100">
                      พร้อมเพย์: <span className="font-bold text-sm text-blue-700">{siteConfig?.bankInfo?.promptPayNumber || "08X-XXX-XXXX"}</span> ({siteConfig?.bankInfo?.accountName || "บจก. โคราช มูฟวี่ เฟสติวัล"})
                    </div>
                  </div>
                ) : (
                  <div className="text-left space-y-3 bg-white p-5 rounded-xl border border-blue-100">
                    <p className="font-bold text-blue-900 text-center border-b pb-2">รายละเอียดบัญชีธนาคารสำหรับโอนเงิน</p>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">ธนาคาร:</span><span className="font-bold">{siteConfig?.bankInfo?.bankName || "กสิกรไทย (KBANK)"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">เลขที่บัญชี:</span><span className="font-bold text-blue-700 text-base">{siteConfig?.bankInfo?.accountNumber || "123-4-56789-0"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">ชื่อบัญชี:</span><span className="font-bold">{siteConfig?.bankInfo?.accountName || "บจก. โคราช มูฟวี่ เฟสติวัล"}</span></div>
                    <div className="flex justify-between text-sm pt-2 border-t"><span className="text-slate-500">ยอดเงินที่ต้องโอน:</span><span className="font-bold text-red-600 text-base">฿{(calculateTotal() / 2).toLocaleString()} บาท</span></div>
                  </div>
                )}
              </div>

              {/* Slip Upload Box */}
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  📎 แนบหลักฐานการโอนเงิน (สลิป) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSlipChange}
                  className="w-full border-2 border-slate-300 rounded-xl p-2 bg-white text-slate-700 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                {formData.slip && (
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    ✅ แนบไฟล์แล้ว: {formData.slip.name}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-sm font-bold text-center">
                  ⚠️ {submitError}
                </div>
              )}

              <div className="flex space-x-4 mt-8">
                <button 
                  onClick={prevStep} 
                  disabled={isSubmitting}
                  className="w-1/3 bg-white border-2 border-slate-300 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  แก้ไขข้อมูล
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-2/3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>⏳ กำลังบันทึกข้อมูล...</span>
                  ) : (
                    <span>ส่งข้อมูลสมัครร้านค้า ✔️</span>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
