"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: any[];
  title: string;
  dataKey: string;
  color: string;
  unit?: string;
}

export default function DeviceChart({ data, title, dataKey, color, unit }: ChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-400">
        <p>กำลังรอข้อมูล {title}...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 text-lg">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></span>
          {title}
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
           20 จุดล่าสุด
        </span>
      </div>
      
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tick={{ dy: 10 }} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
            
            {/* ✅ แก้ไขแล้ว: เพิ่ม 'as any' เพื่อปิด Error ตัวแดง */}
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
              formatter={(value: any) => [`${value} ${unit || ''}`, title] as any}
              labelStyle={{ color: '#6b7280', marginBottom: '5px' }}
              itemStyle={{ color: color, fontWeight: 'bold' }} 
            />

            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3} 
              dot={{ r: 3, fill: color, strokeWidth: 0 }} 
              activeDot={{ r: 7, strokeWidth: 0 }} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}