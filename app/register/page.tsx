"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- ต้องมีฟังก์ชันหลักตัวนี้ครอบอยู่เสมอครับ ---
export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ฟังก์ชันกดปุ่ม (อยู่ข้างในฟังก์ชันหลัก)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // เช็คว่าเป็น JSON ไหม (กัน Error 500)
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          alert("✅ สมัครสมาชิกสำเร็จ!");
          router.push("/login"); // ส่งไปหน้า Login
        } else {
          alert("❌ " + data.message);
        }
      } else {
        const text = await res.text();
        console.error("API Error:", text);
        alert("❌ เกิดข้อผิดพลาดร้ายแรง (Server Error)");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("เชื่อมต่อ Server ไม่ได้");
    }
  };

  // ส่วนแสดงผลหน้าเว็บ (HTML)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-600">สมัครสมาชิก</h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            ยืนยันการสมัคร
          </button>
        </form>
      </div>
    </div>
  );
}