import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    // ดึง Log ล่าสุด 1 ตัว ของ Controller
    const [rows]: any = await (db as any).query(
      "SELECT * FROM web.device_logs WHERE device_id = ? ORDER BY created_at DESC LIMIT 1",
      [deviceId]
    );

    return NextResponse.json(rows[0] || {});
    
  } catch (error) {
    return NextResponse.json({ error: "Database Error" }, { status: 500 });
  }
}