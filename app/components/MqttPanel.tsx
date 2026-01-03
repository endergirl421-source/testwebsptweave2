'use client';
import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

// รับค่า deviceId มาจากหน้าหลัก เพื่อให้ส่งคำสั่งถูกตัว
export default function MqttPanel({ deviceId }: { deviceId: string }) {
  const [status, setStatus] = useState('Connecting...');
  const [lastMsg, setLastMsg] = useState('-');
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);

  // สร้าง Topic จาก DeviceID
  const topicPub = `${deviceId}/command`; 
  const topicSub = `${deviceId}/status`; 

  useEffect(() => {
    // 1. ถ้าไม่มี Device ID ยังไม่ต้อง Connect (กัน Error)
    if (!deviceId) return;

    console.log(`Connecting to MQTT for device: ${deviceId}`);

    // กำหนด Options (ใส่ User/Pass ตรงนี้)
    const options: mqtt.IClientOptions = {
      protocol: 'wss',
      hostname: '5fd7f12c7fb143e982f86a658a479df7.s1.eu.hivemq.cloud',
      port: 8884,
      path: '/mqtt',
      // ⚠️ อย่าลืมใส่ User/Pass ของ HiveMQ คุณตรงนี้ ⚠️
      username: "webdemo", 
      password: "Web12345", 
    };

    const c = mqtt.connect(options);

    c.on('connect', () => {
      setStatus('Connected ✅');
      
      // 🔥 FIX: เช็คก่อนว่าเชื่อมต่ออยู่จริงไหม ก่อนจะ Subscribe (แก้ Error client disconnecting)
      if (c.connected && topicSub) {
        console.log(`Subscribing to: ${topicSub}`);
        c.subscribe(topicSub, (err) => {
          if (err) console.error("Subscribe Error:", err);
        });
      }
    });

    c.on('message', (topic, message) => {
      setLastMsg(message.toString());
      console.log(`Msg received on ${topic}: ${message.toString()}`);
    });

    c.on('error', (err) => {
      console.error("MQTT Error:", err);
      setStatus('Error ❌');
      c.end();
    });

    setClient(c);

    // Cleanup: ทำงานเมื่อเปลี่ยน Device หรือปิดหน้า
    return () => { 
      console.log("Cleanup MQTT connection...");
      if (c) c.end(true); // true = บังคับปิดทันที
    };
  }, [deviceId]); // รันใหม่เมื่อเปลี่ยน Device ID

  const send = (command: string) => {
    if (client && client.connected) {
      console.log(`Sending to ${topicPub}: ${command}`);
      client.publish(topicPub, command);
    } else {
      alert("ยังไม่ได้เชื่อมต่อกับ MQTT Broker");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">แผงควบคุม ({deviceId})</h2>
      
      <div className="mb-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Status:</span>
          <span className={`${status.includes('Connected') ? 'text-green-600' : 'text-red-500'} font-bold`}>
            {status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => send('RESET')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded shadow active:scale-95 text-sm transition">
           RESET
        </button>
        <button onClick={() => send('ALL')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow active:scale-95 text-sm transition">
           ALL
        </button>
        <button onClick={() => send('STOP')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded shadow active:scale-95 text-sm transition">
           STOP
        </button>
      </div>
    </div>
  );
}