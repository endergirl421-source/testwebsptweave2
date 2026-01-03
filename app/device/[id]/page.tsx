import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import MqttPanel from "@/app/components/MqttPanel";
import RealtimeSensorCharts from "@/app/components/RealtimeSensorCharts"; 

const formatFullDate = (date: Date) => {
    return date.toLocaleString('th-TH', { 
        day: '2-digit', month: '2-digit', year: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
    });
};

// 👇 แก้ตรงนี้: ใส่ Promise<{ id: string }>
export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 👇 แก้ตรงนี้: ต้องมี await เพราะ Next.js เวอร์ชันใหม่บังคับ
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 1. ดึง Device Info
  const [deviceRows] = await (db as any).query(
    "SELECT * FROM web.devices WHERE id = ? AND owner_id = ?",
    [id, session.user.id] 
  );
  
  const device = deviceRows[0];

  if (!device) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-red-500">❌ ไม่พบอุปกรณ์</h1>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                กลับหน้าหลัก
            </Link>
        </div>
    );
  }

  // 2. Prepare Data (ตัดช่องว่าง)
  const deviceTypeStr = device.device_type ? String(device.device_type) : '';
  const isSensor = deviceTypeStr.trim().toUpperCase() === 'SENSOR';
  const targetDeviceId = device.device_id ? String(device.device_id).trim() : '';

  // 3. ดึง Log ล่าสุด (สำหรับกรณี Controller เท่านั้น)
  let latestLog: any = null;
  if (!isSensor) {
      const [logs] = await (db as any).query(
        "SELECT * FROM web.device_logs WHERE device_id = ? ORDER BY created_at DESC LIMIT 1", 
        [targetDeviceId]
      );
      latestLog = logs[0];
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition font-medium">
                ⬅️ กลับหน้า Dashboard
            </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{device.device_name}</h1>
                <div className="flex gap-3 text-sm text-gray-500 font-mono">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {device.id}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">MQTT: {targetDeviceId}</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider ${isSensor ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {deviceTypeStr || "Generic"}
                </span>
            </div>
        </div>

        {isSensor ? (
            // ✅ SENSOR: ใช้ Component ใหม่ที่ดึง API เอง (Real-time)
            <RealtimeSensorCharts deviceId={targetDeviceId} />
        ) : (
            // ✅ CONTROLLER: แสดงปุ่มกด
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto items-stretch">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                    <h2 className="font-bold text-lg text-gray-700 mb-4 border-b pb-2">สถานะระบบ</h2>
                    {latestLog ? (
                        <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-4">
                            <div className="text-5xl font-bold text-blue-600 tracking-tight">
                                {latestLog.val || latestLog.value || latestLog.message || "Redy"} 
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-lg p-8">
                            ยังไม่มีข้อมูลส่งเข้ามา
                        </div>
                    )}
                </div>
                <div className="h-full">
                    <MqttPanel deviceId={targetDeviceId} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}