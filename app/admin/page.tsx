import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AssignDeviceForm from './AssignDeviceForm';

// --- 💾 Action 1: ลงทะเบียนอุปกรณ์ใหม่ (Register) ---
async function assignDevice(formData: FormData) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') return;

    const deviceId = formData.get('deviceId');
    const deviceName = formData.get('deviceName');
    const type = formData.get('type');
    const ownerId = formData.get('ownerId');

    if (!deviceId || !ownerId) return;

    await db.query(
      'INSERT INTO devices (device_id, device_name, device_type, owner_id) VALUES (?, ?, ?, ?)',
      [deviceId, deviceName, type, ownerId]
    );
    
    // (Optional) ลบออกจาก Log ด้วยก็ได้ถ้าต้องการ
    // await db.query('DELETE FROM device_logs WHERE device_id = ?', [deviceId]);

    revalidatePath('/admin');
  } catch (error) {
    console.error('Error adding device:', error);
  }
}

// --- 🚫 Action 2: ปฏิเสธรายการค้นหา (ลบ Log ทิ้ง) ---
// ใช้กับปุ่มลบในฟอร์มด้านบน
async function removeNewDeviceLog(formData: FormData) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') return;

    const deviceId = formData.get('deviceId');
    if (!deviceId) return;

    await db.query('DELETE FROM device_logs WHERE device_id = ?', [deviceId]);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error removing log:', error);
  }
}

// --- 🗑️ Action 3: ปลดอุปกรณ์ที่ลงทะเบียนแล้ว (Unregister) ---
// ใช้กับปุ่มลบในตารางด้านล่าง
async function deleteRegisteredDevice(formData: FormData) {
  "use server";
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') return;

    const deviceId = formData.get('deviceId');
    if (!deviceId) return;

    // ลบออกจากตาราง devices
    await db.query('DELETE FROM devices WHERE device_id = ?', [deviceId]);
    
    console.log(`🗑️ Unregistered device: ${deviceId}`);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error unregistering device:', error);
  }
}

// --- 🖥️ หน้า Admin ---
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // เช็คสิทธิ์ Admin
  if (!session || (session.user as any).role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">⛔ Access Denied</h1>
          <p className="text-gray-600">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        </div>
      </div>
    );
  }

  // --- ดึงข้อมูล (พร้อมตัวกัน Error) ---

  // 1. ดึง User
  let users: any[] = [];
  try {
    const [rows]: any = await db.query('SELECT id, username FROM users ORDER BY username ASC');
    users = rows || [];
  } catch (e) { console.error("Error fetching users:", e); }

  // 2. ดึงอุปกรณ์ที่มีอยู่แล้ว
  let existingDevices: any[] = [];
  try {
    const [rows]: any = await db.query(`
      SELECT devices.*, users.username as owner_name 
      FROM devices 
      LEFT JOIN users ON devices.owner_id = users.id
      ORDER BY devices.id DESC
    `);
    existingDevices = rows || [];
  } catch (e) { console.error("Error fetching existing devices:", e); }

  // 3. ดึงอุปกรณ์ใหม่ (จาก Log)
  let newDevices: any[] = [];
  try {
    const [rows]: any = await db.query(`
      SELECT device_id, MAX(type) as type
      FROM device_logs 
      WHERE device_id NOT IN (SELECT device_id FROM devices)
      GROUP BY device_id
    `);
    newDevices = rows || [];
  } catch (e) { console.error("Error fetching new devices:", e); }

  // --- ส่วนแสดงผล UI ---
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
             Admin Panel 
          </h1>
          <span className="text-sm bg-gray-200 text-gray-700 py-1 px-3 rounded-full">
            Admin: {session.user?.name}
          </span>
        </div>

        {/* 1. ส่วนฟอร์มลงทะเบียน (ด้านบน) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">
            จัดการอุปกรณ์ใหม่ (Detected Devices)
          </h2>
          <AssignDeviceForm 
            users={users} 
            newDevices={newDevices} 
            assignDeviceAction={assignDevice} 
            removeDeviceAction={removeNewDeviceLog} 
          />
        </div>

        {/* 2. ส่วนตารางรายการ (ด้านล่าง) */}
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
            <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2 text-lg">
              อุปกรณ์ที่ลงทะเบียนแล้ว 
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded-full">
                {existingDevices.length}
              </span>
            </h3>
            
            {existingDevices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                          <th className="p-3 border-b">Device ID</th>
                          <th className="p-3 border-b">Display Name</th>
                          <th className="p-3 border-b">Owner</th>
                          <th className="p-3 border-b">Type</th>
                          <th className="p-3 border-b text-center text-red-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {existingDevices.map((d: any) => (
                            <tr key={d.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 font-mono text-gray-600 font-bold">{d.device_id}</td>
                                <td className="p-3 text-gray-800 font-medium">{d.device_name}</td>
                                <td className="p-3">
                                  {d.owner_name ? (
                                    <span className="bg-blue-50 text-blue-700 py-1 px-2 rounded-md text-xs font-bold border border-blue-100">
                                      👤 {d.owner_name}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">- No Owner -</span>
                                  )}
                                </td>
                                <td className="p-3 text-gray-500">{d.device_type}</td>
                                
                                {/*  ปุ่มลบ (Unregister) */}
                                <td className="p-3 text-center">
                                  <form action={deleteRegisteredDevice}>
                                    <input type="hidden" name="deviceId" value={d.device_id} />
                                    <button 
                                      type="submit"
                                      className="bg-white text-red-500 border border-red-200 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded transition text-xs font-bold shadow-sm"
                                    >
                                      🗑️ Unregister
                                    </button>
                                  </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">ยังไม่มีอุปกรณ์ในระบบ</p>
                <p className="text-gray-400 text-sm mt-1">ใช้อุปกรณ์ IoT เชื่อมต่อเข้ามา หรือเพิ่มข้อมูลผ่านฟอร์มด้านบน</p>
              </div>
            )}
        </div>

      </div>
    </div>
  );
}