"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Check, X, Search, Inbox } from "lucide-react";

type Status = "all" | "pending" | "approved" | "rejected";

interface Testimonial {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  rating: number;
  text: string;
  avatarUrl: string | null;
  source: "widget" | "email" | "manual";
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
}

const STATUS_TABS: { label: string; value: Status }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-900/40 text-amber-300",
  approved: "bg-teal-900/40 text-teal-300",
  rejected: "bg-red-900/40 text-red-300",
};

const SOURCE_STYLES: Record<string, string> = {
  widget: "bg-teal-900/30 text-teal-400",
  email: "bg-blue-900/30 text-blue-400",
  manual: "bg-slate-700 text-slate-300",
};

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ background: "#0d9488" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
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

export default function TestimonialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("status") as Status) || "all";

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const qs = activeTab !== "all" ? `?status=${activeTab}` : "";
      const res = await fetch(`/api/testimonials${qs}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTestimonials(data.testimonials ?? []);

      // Fetch counts for all statuses
      const [all, pending, approved, rejected] = await Promise.all([
        fetch("/api/testimonials").then((r) => r.json()),
        fetch("/api/testimonials?status=pending").then((r) => r.json()),
        fetch("/api/testimonials?status=approved").then((r) => r.json()),
        fetch("/api/testimonials?status=rejected").then((r) => r.json()),
      ]);
      setCounts({
        all: all.pagination?.total ?? 0,
        pending: pending.pagination?.total ?? 0,
        approved: approved.pagination?.total ?? 0,
        rejected: rejected.pagination?.total ?? 0,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void fetchTestimonials();
  }, [fetchTestimonials]);

  const changeTab = (tab: Status) => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("status", tab);
    router.push(`/dashboard/testimonials${params.size ? `?${params}` : ""}`);
  };

  // Client-side search filter
  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.text.toLowerCase().includes(search.toLowerCase()) ||
      (t.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  };

  const patchStatus = async (
    id: string,
    status: "approved" | "rejected" | "pending",
    featured?: boolean
  ) => {
    // Optimistic update
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, ...(featured !== undefined ? { featured } : {}) }
          : t
      )
    );
    try {
      const body: Record<string, unknown> = { status };
      if (featured !== undefined) body.featured = featured;
      await fetch(`/api/testimonials/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Revert on error
      void fetchTestimonials();
    }
  };

  const toggleFeatured = async (t: Testimonial) => {
    const newFeatured = !t.featured;
    setTestimonials((prev) =>
      prev.map((item) =>
        item.id === t.id ? { ...item, featured: newFeatured } : item
      )
    );
    try {
      await fetch(`/api/testimonials/${t.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: t.status, featured: newFeatured }),
      });
    } catch {
      void fetchTestimonials();
    }
  };

  const bulkAction = async (status: "approved" | "rejected") => {
    const ids = Array.from(selected);
    // Optimistic
    setTestimonials((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, status } : t))
    );
    setSelected(new Set());
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/testimonials/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )
    );
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Testimonials</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/10">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => changeTab(value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative -mb-px ${
              activeTab === value
                ? "text-teal-400 border-b-2 border-teal-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
            {counts[value] !== undefined && (
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === value
                    ? "bg-teal-900/50 text-teal-300"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + bulk */}
      <div className="flex gap-3 mb-5 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-teal-500"
            style={{ background: "#0f172a" }}
          />
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkAction("approved")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-teal-700 hover:bg-teal-600 text-white transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Approve ({selected.size})
            </button>
            <button
              onClick={() => bulkAction("rejected")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-800 hover:bg-red-700 text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reject ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 font-medium">No testimonials found</p>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab !== "all"
              ? `No ${activeTab} testimonials yet`
              : "Start collecting testimonials to see them here"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-teal-500"
                  />
                </th>
                <th className="px-4 py-3 text-slate-400 font-medium">Customer</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Rating</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Testimonial</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Source</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-center">⭐</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Date</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="accent-teal-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={t.name} avatarUrl={t.avatarUrl} />
                      <div>
                        <div className="font-medium text-white text-sm">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.email}</div>
                        {t.company && (
                          <div className="text-xs text-slate-500">{t.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={t.rating} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-300 text-sm line-clamp-2">{t.text}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        SOURCE_STYLES[t.source] ?? "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {t.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        STATUS_STYLES[t.status] ?? "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured(t)}
                      title={t.featured ? "Unfeature" : "Feature"}
                      className={`text-lg transition-opacity ${
                        t.featured ? "opacity-100" : "opacity-20 hover:opacity-60"
                      }`}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {t.status !== "approved" && (
                        <button
                          onClick={() => patchStatus(t.id, "approved")}
                          title="Approve"
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-teal-900/40 hover:bg-teal-700/60 text-teal-400 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {t.status !== "rejected" && (
                        <button
                          onClick={() => patchStatus(t.id, "rejected")}
                          title="Reject"
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-red-900/40 hover:bg-red-700/60 text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
