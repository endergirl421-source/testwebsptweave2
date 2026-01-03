// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutBtn from "../components/LogoutBtn";
import MqttPanel from "../components/MqttPanel";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); 
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* --- 1. Top Navigation Bar --- */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                  AMU <span className="text-green-600">Dashboard</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name || "User"}
                </span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                  {session?.user?.role || "Member"}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="border-l pl-4 border-gray-200">
                <LogoutBtn />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- 2. Main Content Area --- */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              แผงควบคุมหลัก
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              ควบคุมและติดตามสถานะอุปกรณ์ MQTT แบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: MQTT Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔧 อุปกรณ์ควบคุม (Control Panel)
                </h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              
              {/* ✨ แก้ไขตรงนี้: เพิ่ม flex justify-center เพื่อจัดกึ่งกลาง */}
              <div className="p-6 flex justify-center items-center bg-gray-50/30">
                <MqttPanel />
              </div>

            </div>
          </div>

          {/* Right Column: Stats / Info */}
          <div className="space-y-6">
            {/* System Status Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
              <div className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">สถานะระบบ</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Connection</span>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Server Time</span>
                    <span className="text-sm font-medium text-gray-700">
                        {new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400">
                        Logged in as: <span className="text-gray-600">{session?.user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}