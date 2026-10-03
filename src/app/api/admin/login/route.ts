import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_PASSWORD || "kmf2026";

    if (username === expectedUser && password === expectedPass) {
      return NextResponse.json({
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        token: "kmf_authenticated_session_token",
      });
    }

    return NextResponse.json(
      { success: false, error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" },
      { status: 500 }
    );
  }
}
