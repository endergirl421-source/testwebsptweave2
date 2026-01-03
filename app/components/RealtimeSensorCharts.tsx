"use client";

import { useEffect, useState } from "react";
import DeviceChart from "./DeviceChart";

export default function RealtimeSensorCharts({ deviceId }: { deviceId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>("-");

  // ฟังก์ชันไปดึงข้อมูลใหม่
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/sensor/${deviceId}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
        if (json.length > 0) {
           // เอาเวลาตัวสุดท้ายมาโชว์
           const last = json[json.length - 1]; 
           setLastUpdate(new Date(last.timestamp).toLocaleString('th-TH'));
        }
      }
    } catch (err) {
      console.error("Error fetching sensor data:", err);
    }
  };

  useEffect(() => {
    fetchData(); // ดึงครั้งแรกทันที
    const interval = setInterval(fetchData, 2000); // ดึงใหม่ทุก 2 วินาที (แก้เลขได้ตามใจชอบ)
    return () => clearInterval(interval);
  }, [deviceId]);

  // ถ้ายังไม่มีข้อมูล ให้รอแป๊บนึง
  if (data.length === 0) {
    return <div className="text-center p-10 text-gray-400 animate-pulse">⏳ กำลังเชื่อมต่อข้อมูล Real-time...</div>;
  }

  // ดึงค่าล่าสุดมาโชว์ในการ์ดตัวเลข
  const latest = data[data.length - 1];

  return (
    <div className="space-y-8">
       {/* ส่วนกราฟ */}
       <DeviceChart data={data} title="Temperature (อุณหภูมิ)" dataKey="temp" color="#f97316" unit="°C" />
       <DeviceChart data={data} title="pH Level (ค่ากรดด่าง)" dataKey="ph" color="#22c55e" unit="pH" />
       <DeviceChart data={data} title="Dissolved Oxygen (DO)" dataKey="do" color="#3b82f6" unit="mg/L" />

       {/* ส่วนการ์ดตัวเลข (ขยับตามกราฟ) */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-orange-500 text-center">
                <div className="text-gray-400 text-xs uppercase font-bold">Temperature</div>
                <div className="text-3xl font-bold text-gray-800 transition-all">{latest.temp} °C</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-green-500 text-center">
                <div className="text-gray-400 text-xs uppercase font-bold">pH Level</div>
                <div className="text-3xl font-bold text-gray-800 transition-all">{latest.ph}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-500 text-center">
                <div className="text-gray-400 text-xs uppercase font-bold">Dissolved Oxygen</div>
                <div className="text-3xl font-bold text-gray-800 transition-all">{latest.do} μg/L</div>
            </div>
       </div>

       <div className="text-center text-xs text-green-600 mt-2 flex justify-center items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Update: {lastUpdate}
       </div>
    </div>
  );
}