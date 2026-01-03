'use client';
import { signOut } from "next-auth/react";

export default function LogoutBtn() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
    >
      ออกจากระบบ
    </button>
  );
}
