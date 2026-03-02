import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand text-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">T</div>
          <span className="font-bold text-lg">TestimonialKit</span>
        </div>
        <span className="text-teal-100 text-sm">Welcome, {session.user.name || session.user.email}</span>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-brand text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-1">Testimonials</h3>
            <p className="text-gray-500 text-sm">Manage your collected testimonials</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-brand text-3xl mb-3">🧱</div>
            <h3 className="font-semibold text-gray-900 mb-1">Widgets</h3>
            <p className="text-gray-500 text-sm">Configure your Wall of Love widgets</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="text-brand text-3xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Email Collection</h3>
            <p className="text-gray-500 text-sm">Send collection emails to customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
