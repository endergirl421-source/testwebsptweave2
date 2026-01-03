import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; 
import db from '@/lib/db'; // <--- บรรทัดนี้มันจะเรียกไฟล์ที่คุณเพิ่งสร้างเมื่อกี้มาใช้งานครับ

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // เช็คว่ากรอกครบไหม
    if (!username || !password) {
      return NextResponse.json({ message: 'กรอกข้อมูลไม่ครบ' }, { status: 400 });
    }

    // เช็คชื่อซ้ำ
    const [existingUser]: any = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'ชื่อนี้มีคนใช้แล้ว' }, { status: 400 });
    }

    // เข้ารหัสและบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'USER']
    );

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ!' });

  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}