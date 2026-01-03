import { NextResponse } from "next/server";
import db from "@/lib/db";

// บังคับให้ไม่จำค่าเก่า (ดึงใหม่เสมอ)
export const dynamic = "force-dynamic";

// 👇 แก้ตรงนี้ 1: ใส่ Promise<{ deviceId: string }>
export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    // 👇 แก้ตรงนี้ 2: ต้อง await params ก่อนดึงค่า
    const { deviceId } = await params;

    // ดึงข้อมูล 20 ตัวล่าสุดจาก sensor.devices_sensor
    const [rows]: any = await (db as any).query(
      `SELECT * FROM sensor.devices_sensor 
       WHERE device_id = ? 
       ORDER BY timestamp DESC LIMIT 20`,
      [deviceId]
    );

    // จัดรูปแบบข้อมูลเตรียมส่งให้กราฟ
    const formattedData = rows.map((l: any) => ({
      time: new Date(l.timestamp).toLocaleTimeString('th-TH', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
      }),
      temp: parseFloat(l.temp || 0),
      ph: parseFloat(l.ph || 0),
      do: parseFloat(l.do || 0),
      timestamp: l.timestamp 
    })).reverse(); 

    return NextResponse.json(formattedData);
    
  } catch (error) {
    return NextResponse.json({ error: "Database Error" }, { status: 500 });
  }
}