"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ตรวจสอบสถานะการเข้าสู่ระบบจาก LocalStorage
    const token = localStorage.getItem("kmf_admin_token");
    if (token === "kmf_authenticated_session_token") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("kmf_admin_token", data.token);
        setIsAuthenticated(true);
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
    localStorage.removeItem("kmf_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-400">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // 2. Login Screen (ถ้ายังไม่ได้ล็อกอิน)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="bg-[#1B1B1B] text-[#F2E5D0] p-8 text-center border-b-4 border-amber-400">
            <div className="w-16 h-16 rounded-2xl bg-[#1F5B5A] text-amber-400 font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              🎬
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              KMF ADMIN LOGIN
            </h1>
            <p className="text-xs text-amber-300 mt-1 font-semibold">
              ระบบจัดการหลังบ้าน Korat Movie Festival 2026
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="text-center text-xs text-slate-500 mb-2">
              🔒 พื้นที่สำหรับทีมงานผู้จัดงาน กรุณาลงชื่อเข้าใช้
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold p-3.5 rounded-xl text-center">
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
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ (Sign In) ➔"}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                ← กลับสู่หน้าหลักของงาน
              </Link>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B1B1B] text-[#F2E5D0] flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-xl font-black text-[#F2A11B] tracking-wider uppercase">KMF ADMIN</h1>
              <p className="text-xs text-gray-400">Korat Movie Festival 2026</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              pathname === "/admin" ? "bg-amber-400 text-black font-bold shadow-md" : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
            }`}
          >
            <span>📊</span> ภาพรวม (Dashboard)
          </Link>
          <Link 
            href="/admin/zones" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              pathname === "/admin/zones" ? "bg-amber-400 text-black font-bold shadow-md" : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
            }`}
          >
            <span>📍</span> จัดการโซน & ราคา
          </Link>
          <Link 
            href="/admin/media" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              pathname === "/admin/media" ? "bg-amber-400 text-black font-bold shadow-md" : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
            }`}
          >
            <span>🖼️</span> อัปโหลดรูปภาพ & ผังงาน
          </Link>
          <Link 
            href="/admin/vendors" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              pathname === "/admin/vendors" ? "bg-amber-400 text-black font-bold shadow-md" : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
            }`}
          >
            <span>🏪</span> ร้านค้า & ตรวจสลิป
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
              pathname === "/admin/settings" ? "bg-amber-400 text-black font-bold shadow-md" : "text-gray-300 hover:bg-[#1F5B5A] hover:text-white"
            }`}
          >
            <span>⚙️</span> ตั้งค่า Google API
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition"
          >
            <span>🚪</span> ออกจากระบบ (Logout)
          </button>
          <Link href="/" className="block px-4 py-2 text-center text-xs font-medium text-gray-400 hover:text-white transition">
            ⬅️ กลับไปหน้าหลักงาน
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">ระบบจัดการงาน Korat Movie Festival 2026</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              ● เข้าสู่ระบบแล้ว
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition"
            >
              ออกจากระบบ
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50">
          {children}
        </div>
      </main>
      
    </div>
  );
}
