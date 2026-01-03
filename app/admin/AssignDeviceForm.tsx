"use client";

import { useState } from "react";
import Link from "next/link";

export default function AssignDeviceForm({ users, newDevices, assignDeviceAction }: any) {
  
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("sensor");
  const [selectedDeviceId, setSelectedDeviceId] = useState(""); 

  const handleDeviceChange = (e: any) => {
    const selectedId = e.target.value;
    setSelectedDeviceId(selectedId);
    const device = newDevices.find((d: any) => d.device_id === selectedId);
    if (device) {
      setDeviceName(device.device_id); 
      setDeviceType(device.type || "sensor");
    } else {
      setDeviceName("");
      setDeviceType("sensor");
    }
  };

  return (
    <form action={assignDeviceAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ... (ส่วน Dropdown และ Input ชื่อ เหมือนเดิม) ... */}
      
      {/* 1. Dropdown เลือกอุปกรณ์ */}
      <div className="col-span-1 md:col-span-2 bg-yellow-50 p-4 rounded border border-yellow-200">
        <label className="block text-sm font-bold mb-2 text-yellow-800">
           เลือกอุปกรณ์ที่ตรวจพบ ({newDevices.length} เครื่อง):
        </label>
        {newDevices.length > 0 ? (
          <select 
            name="deviceId" 
            className="w-full border-2 border-yellow-400 p-2 rounded text-lg font-bold text-gray-700 cursor-pointer" 
            required onChange={handleDeviceChange} defaultValue=""
          >
            <option value="">-- จิ้มเลือกได้เลย --</option>
            {newDevices.map((d: any, index: number) => (
              <option key={index} value={d.device_id}> {d.device_id}</option>
            ))}
          </select>
        ) : (
          <div className="text-gray-500 italic">(ไม่พบอุปกรณ์ใหม่)</div>
        )}
      </div>

      {/* 2. ชื่อ */}
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-bold mb-1 text-gray-600">ชื่ออุปกรณ์</label>
        <input name="deviceName" type="text" placeholder="ชื่อเรียก" required 
          className="w-full border p-2 rounded bg-gray-50 text-gray-600"
          value={deviceName} onChange={(e) => setDeviceName(e.target.value)}
        />
      </div>
      <input type="hidden" name="type" value={deviceType} />

      {/* 3. เจ้าของ */}
      <div className="col-span-1 md:col-span-2">
        <label className="block text-sm font-bold text-blue-800 mb-1 text-gray-600">User</label>
        <select name="ownerId" className="w-full border p-2 rounded text-gray-600" required>
          <option value="">-- เลือก User --</option>
          {users.map((u: any) => (
            <option key={u.id} value={u.id}>👤 {u.username}</option>
          ))}
        </select>
      </div>

      {/* ปุ่มบันทึกปุ่มเดียวพอ */}
      <button 
        type="submit" disabled={!selectedDeviceId}    
        className="col-span-1 md:col-span-2 bg-green-500 disabled:bg-gray-300 text-white font-bold py-3 rounded shadow hover:bg-green-700 transition"
      >
         บันทึกเข้าระบบ
      </button>

      <Link href="/" className="col-span-1 md:col-span-2 text-center text-gray-500 underline">
        กลับหน้าหลัก
      </Link>
    </form>
  );
}