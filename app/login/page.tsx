"use client"; // ต้องใส่เสมอสำหรับหน้าที่มีฟอร์ม

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // เคลียร์ Error เก่าก่อน

    // เรียกใช้ NextAuth เพื่อ Login
    const result = await signIn("credentials", {
      username: username,
      password: password,
      redirect: false, // เราจะสั่งเปลี่ยนหน้าเอง
    });

    if (result?.error) {
      setError("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } else {
      // Login ผ่าน! ไปหน้าแรก (หรือหน้า Admin ถ้าอยากแยก)
      router.push("/"); 
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h1>
        
        {/* กล่องแดงแจ้งเตือน Error */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="กรอกชื่อผู้ใช้"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="กรอกรหัสผ่าน"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition shadow-md"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ยังไม่มีบัญชี? <a href="/register" className="text-blue-600 hover:underline">สมัครสมาชิกที่นี่</a>
        </p>
      </div>
    </div>
  );
}