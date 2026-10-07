"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // ค่าเริ่มต้นเป็น false เสมอ เพื่อบังคับให้ใส่รหัสทุกครั้งเมื่อเปิดเว็บ รีเฟรช หรือกลับเข้ามาใหม่
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ล้าง token เก่าออกจาก localStorage ทั้งหมด เพื่อความปลอดภัยสูงสุด
    // ป้องกันเครื่องที่เคยเข้ารหัสค้างไว้เข้าได้อัตโนมัติ
    try {
      localStorage.removeItem("kmf_admin_token");
      sessionStorage.removeItem("kmf_admin_token");
    } catch (e) {}

    // ทุกครั้งที่เปิดหน้า หรือรีเฟรชใหม่ จะเริ่มต้นที่หน้า Login เสมอ
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  // ปิดเมนูมือถืออัตโนมัติเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        // ไม่บันทึกลง localStorage ถาวร เพื่อให้เมื่อรีเฟรชหรือเปิดใหม่ต้องใส่รหัสเสมอ
      } else {
        setErrorMsg(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("kmf_admin_token");
      sessionStorage.removeItem("kmf_admin_token");
    } catch (e) {}
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setMobileMenuOpen(false);
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-400">กำลังเตรียมระบบความปลอดภัย...</p>
        </div>
      </div>
    );
  }

  // 2. Login Screen (บังคับใส่รหัสทุกครั้ง)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-3 sm:p-6 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="bg-[#1B1B1B] text-[#F2E5D0] p-6 sm:p-8 text-center border-b-4 border-amber-400">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1F5B5A] text-amber-400 font-black text-2xl sm:text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              🎬
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              KMF ADMIN LOGIN
            </h1>
            <p className="text-xs text-amber-300 mt-1 font-semibold">
              ระบบจัดการหลังบ้าน Korat Movie Festival 2026
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-400/40">
              <span>🔒</span> ยืนยันตัวตนทุกครั้งเพื่อความปลอดภัย
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4 sm:space-y-5">
            <div className="text-center text-xs text-slate-500 mb-1">
              กรุณาระบุชื่อผู้ใช้งานและรหัสผ่านสำหรับเจ้าหน้าที่
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold p-3.5 rounded-xl text-center animate-shake">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ระบุชื่อผู้ใช้งาน"
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ระบุรหัสผ่าน"
                className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ (Sign In) ➔"}
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1">
                ← กลับสู่หน้าหลักของงาน
              </Link>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // เมนูนำทางของระบบ
  const navItems = [
    { href: "/admin", label: "ภาพรวม (Dashboard)", icon: "📊" },
    { href: "/admin/zones", label: "จัดการโซน & ราคา", icon: "📍" },
    { href: "/admin/media", label: "อัปโหลดรูปภาพ & ผังงาน", icon: "🖼️" },
    { href: "/admin/vendors", label: "ร้านค้า & ตรวจสลิป", icon: "🏪" },
    { href: "/admin/settings", label: "ตั้งค่า Google API", icon: "⚙️" },
  ];

  // 3. Authenticated Admin Portal (Fully Responsive)
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800 relative">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer (Slide-Over on Mobile) */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#1B1B1B] text-[#F2E5D0] flex flex-col shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-lg font-black text-[#F2A11B] tracking-wider uppercase">KMF ADMIN</h1>
              <p className="text-[11px] text-gray-400">Korat Movie Festival 2026</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  active 
                    ? "bg-amber-400 text-black shadow-md" 
                    : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 transition cursor-pointer"
          >
            <span>🚪</span> ออกจากระบบ (Logout)
          </button>
          <Link 
            href="/" 
            className="block px-4 py-2 text-center text-xs font-medium text-gray-400 hover:text-white transition"
          >
            ⬅️ กลับไปหน้าหลักงาน
          </Link>
        </div>
      </aside>

      {/* Desktop Sidebar (Permanent on md and above) */}
      <aside className="hidden md:flex w-64 bg-[#1B1B1B] text-[#F2E5D0] flex-col shadow-xl shrink-0 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-xl font-black text-[#F2A11B] tracking-wider uppercase">KMF ADMIN</h1>
              <p className="text-xs text-gray-400">Korat Movie Festival 2026</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  active 
                    ? "bg-amber-400 text-black font-bold shadow-md" 
                    : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition cursor-pointer"
          >
            <span>🚪</span> ออกจากระบบ (Logout)
          </button>
          <Link href="/" className="block px-4 py-2 text-center text-xs font-medium text-gray-400 hover:text-white transition">
            ⬅️ กลับไปหน้าหลักงาน
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar */}
        <header className="bg-white shadow-xs h-16 flex items-center justify-between px-3 sm:px-6 md:px-8 border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <span className="text-xl leading-none">☰</span>
            </button>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 truncate">
              ระบบจัดการงาน KMF 2026
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline-flex text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> เข้าสู่ระบบแล้ว
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer"
            >
              ออกจากระบบ
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-3.5 sm:p-6 md:p-8 bg-slate-50 overflow-x-hidden">
          {children}
        </div>
      </main>
      
    </div>
  );
}

