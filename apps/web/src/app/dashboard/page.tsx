import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Star, Clock, Award, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatsData {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  avgRating: string | null;
  featured: number;
  recentActivity: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    rating: number;
    text: string;
    status: string;
    source: string;
    createdAt: string;
  }>;
}

async function getStats(): Promise<StatsData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stats`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{ color: i <= rating ? "#0d9488" : "#334155" }}
          fill={i <= rating ? "#0d9488" : "none"}
        />
      ))}
    </div>
  );
}

function sourceBadge(source: string) {
  const map: Record<string, { label: string; color: string }> = {
    widget: { label: "Widget", color: "bg-teal-900/50 text-teal-300" },
    email: { label: "Email", color: "bg-blue-900/50 text-blue-300" },
    manual: { label: "Manual", color: "bg-slate-700 text-slate-300" },
  };
  const s = map[source] ?? { label: source, color: "bg-slate-700 text-slate-300" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>
      {s.label}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getStats();

  const statCards = [
    {
      label: "Total Testimonials",
      value: stats?.total ?? 0,
      icon: TrendingUp,
      color: "text-teal-400",
      bg: "bg-teal-900/20",
    },
    {
      label: "Pending Review",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-900/20",
    },
    {
      label: "Avg Rating",
      value: stats?.avgRating ? `${stats.avgRating} ★` : "—",
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
    },
    {
      label: "Featured",
      value: stats?.featured ?? 0,
      icon: Award,
      color: "text-purple-400",
      bg: "bg-purple-900/20",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">
        Welcome back, {session.user.name || session.user.email}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-5 border border-white/10"
            style={{ background: "#1e293b" }}
          >
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Testimonials</h2>
        {!stats || stats.recentActivity.length === 0 ? (
          <div className="rounded-xl border border-white/10 p-10 text-center text-slate-500">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No testimonials yet. Start collecting!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/10">
              {stats.recentActivity.map((t) => (
                <div key={t.id} className="flex items-start gap-4 px-5 py-4">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "#0d9488", color: "#fff" }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">{t.name}</span>
                      {t.company && (
                        <span className="text-slate-400 text-xs">· {t.company}</span>
                      )}
                      <StarRating rating={t.rating} />
                      {sourceBadge(t.source)}
                    </div>
                    <p className="text-slate-300 text-sm mt-1 line-clamp-2">{t.text}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
