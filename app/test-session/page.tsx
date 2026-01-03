import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function TestSessionPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">🕵️ หน้าตรวจสอบ Session</h1>
      <div className="bg-black text-green-400 p-6 rounded shadow-lg font-mono whitespace-pre-wrap">
        {JSON.stringify(session, null, 2)}
      </div>

      <div className="mt-6 text-gray-600">
        <p>ถ้า role เป็น "ADMIN" = ระบบถูกต้อง (อาจผิดที่โค้ดหน้า Admin)</p>
        <p>ถ้า role เป็น null/undefined = ระบบ Login มีปัญหา</p>
      </div>
    </div>
  );
}