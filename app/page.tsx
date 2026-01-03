import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";

export default async function Home() {
  // 1. เช็คว่าล็อกอินยัง?
  const session = await getServerSession(authOptions);

  // ถ้ายังไม่ล็อกอิน ให้ดีดไปหน้า Login
  if (!session) {
    redirect("/login");
  }

  // 2. ดึงข้อมูลอุปกรณ์ของคนๆ นี้
  const [myDevices]: any = await db.query(
    "SELECT * FROM devices WHERE owner_id = ?",
    [session.user.id]
  );

  // เช็คว่าเป็น Admin หรือไม่ (แปลงเป็นตัวพิมพ์ใหญ่กันพลาด)
  const isAdmin = session.user.role?.toUpperCase() === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* --- ส่วนหัว --- */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            สวัสดี, {session.user.name}
          </h1>
          <p className="text-gray-500 mt-1">
            สถานะ: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">{session.user.role}</span>
          </p>
        </div>
        
        {/* ปุ่ม Logout */}
        <Link 
          href="/api/auth/signout" 
          className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
        >
          ออกจากระบบ
        </Link>
      </div>

      {/* --- ส่วนของ Admin (โชว์เฉพาะถ้า isAdmin เป็นจริง) --- */}
      {isAdmin && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 flex justify-between items-center shadow-sm rounded-r">
          <div>
            <p className="font-bold text-yellow-800 text-lg">Admin Zone</p>
            <p className="text-yellow-700 text-sm">คุณมีสิทธิ์จัดการอุปกรณ์ในระบบ</p>
          </div>
          <Link 
            href="/admin" 
            className="bg-yellow-500 text-white px-5 py-2 rounded shadow hover:bg-yellow-600 hover:shadow-md transition font-bold"
          >
            ไปหน้า Admin Panel &rarr;
          </Link>
        </div>
      )}

      {/* --- ส่วนแสดงอุปกรณ์ของฉัน --- */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl"></span>
        <h2 className="text-xl font-bold text-gray-800">อุปกรณ์ของฉัน</h2>
      </div>
      
      {myDevices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
          <p className="text-lg">ยังไม่มีอุปกรณ์</p>
          <p className="text-sm">(ต้องให้ Admin เพิ่มให้ก่อนนะ)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDevices.map((device: any) => (
            <div key={device.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition duration-300">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{device.device_name}</h3>
                    <p className="text-gray-400 text-xs mt-1 font-mono">ID: {device.device_id}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase">
                  {device.device_type || 'Device'}
                </span>
              </div>
              
              {/* 👇 จุดที่แก้: เปลี่ยน button เป็น Link แล้วครับ */}
              <Link 
                href={`/device/${device.id}`}
                className="block w-full text-center bg-gray-50 text-gray-600 font-medium py-2.5 rounded-lg border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                ดูสถานะ / สั่งงาน
              </Link>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}