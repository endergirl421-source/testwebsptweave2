"use server"; // 👈 สำคัญมาก! บอก Next.js ว่านี่คือโค้ดฝั่ง Server

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ชี้ไปหาไฟล์ authOptions ของคุณ
import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- 🛠️ Action 1: บันทึกอุปกรณ์ (Assign) ---
export async function assignDevice(formData: FormData) {
  // 1. เช็คสิทธิ์ Admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    // ถ้าไม่ใช่ Admin ให้เด้งออก หรือ return error
    return;
  }

  // 2. ดึงค่าจาก Form
  const deviceId = formData.get("deviceId") as string;
  const deviceName = formData.get("deviceName") as string;
  const ownerId = formData.get("ownerId") as string;
  const type = formData.get("type") as string;

  if (!deviceId || !ownerId) return;

  try {
    // 3. บันทึกลงฐานข้อมูล (ตัวอย่าง: ย้ายจาก temp ไป devices หรือ update)
    // ⚠️ แก้ SQL ตามตารางจริงของคุณนะ
    // เช่น: INSERT INTO devices ... หรือ UPDATE devices SET owner_id = ? ...
    
    await db.query(
      `INSERT INTO devices (device_id, name, type, owner_id, created_at) 
       VALUES (?, ?, ?, ?, NOW())`, 
      [deviceId, deviceName, type, ownerId]
    );

    // ลบออกจากรายการค้นหา (ถ้ามีตาราง temp)
    await db.query("DELETE FROM temp_devices WHERE device_id = ?", [deviceId]);

    console.log(`✅ Assigned ${deviceId} to User ${ownerId}`);

  } catch (error) {
    console.error("Assign Error:", error);
    // จัดการ Error ตามต้องการ
  }

  // 4. รีเฟรชหน้าจอ (เพื่อให้ Dropdown อัปเดตทันที)
  revalidatePath("/admin");
  redirect("/admin"); // หรือจะ redirect ไปหน้าอื่น
}


// --- 🗑️ Action 2: ลบอุปกรณ์ทิ้ง (Remove) ---
export async function removeNewDevice(formData: FormData) {
  // 1. เช็คสิทธิ์ Admin (ปลอดภัยไว้ก่อน)
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    console.error("⛔ ใครเนี่ย? ไม่ใช่ Admin ห้ามลบ!");
    return;
  }

  // 2. ดึง ID อุปกรณ์
  const deviceId = formData.get("deviceId") as string;
  if (!deviceId) return;

  try {
    // 3. ลบจาก Database
    // ⚠️ แก้ชื่อตาราง 'temp_devices' เป็นชื่อตารางที่คุณใช้เก็บอุปกรณ์ที่รอลงทะเบียน
    await db.query("DELETE FROM temp_devices WHERE device_id = ?", [deviceId]);
    
    console.log(`🗑️ Deleted device: ${deviceId} by Admin: ${session.user.name}`);

  } catch (error) {
    console.error("Delete Error:", error);
  }

  // 4. รีเฟรชหน้าจอ (Dropdown ในหน้าเว็บจะหายไปเอง)
  revalidatePath("/admin");
}