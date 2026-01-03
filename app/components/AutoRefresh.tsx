"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh(); // สั่งรีโหลดข้อมูลใหม่ทุก 3 วินาที
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);
  return null;
}