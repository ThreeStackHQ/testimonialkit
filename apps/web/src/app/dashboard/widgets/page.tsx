"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface WidgetConfig {
  theme?: string;
  accentColor?: string;
  maxCount?: number;
  showRating?: boolean;
  showCompany?: boolean;
}

interface Widget {
  id: string;
  name: string;
  type: "wall" | "slider" | "card";
  config: WidgetConfig;
  active: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  wall: "Wall",
  slider: "Slider",
  card: "Card",
};

const TYPE_COLORS: Record<string, string> = {
  wall: "bg-teal-900/40 text-teal-300",
  slider: "bg-blue-900/40 text-blue-300",
  card: "bg-purple-900/40 text-purple-300",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Widget | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"wall" | "slider" | "card">("wall");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("your-api-key");
  const [embedTab, setEmbedTab] = useState<"wall" | "collect">("wall");

  // Config edit state
  const [editConfig, setEditConfig] = useState<WidgetConfig>({});
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"wall" | "slider" | "card">("wall");

  useEffect(() => {
    void fetchWidgets();
    // Fetch api key from workspace info (use stats as proxy)
    fetch("/api/stats")
      .then((r) => r.json())
      .then(() => {})
      .catch(() => {});
  }, []);

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/widgets");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setWidgets(data.widgets ?? []);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const selectWidget = (w: Widget) => {
    setSelected(w);
    setEditName(w.name);
    setEditType(w.type);
    setEditConfig(w.config ?? {});
    setShowNew(false);
  };

  const createWidget = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType, config: {} }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const w: Widget = data.widget;
      setWidgets((prev) => [w, ...prev]);
      selectWidget(w);
      setShowNew(false);
      setNewName("");
    } catch {
      //
    } finally {
      setCreating(false);
    }
  };

  const saveWidget = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/widgets/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, type: editType, config: editConfig }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const updated: Widget = data.widget;
      setWidgets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setSelected(updated);
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (w: Widget) => {
    const newActive = !w.active;
    setWidgets((prev) =>
      prev.map((item) => (item.id === w.id ? { ...item, active: newActive } : item))
    );
    if (selected?.id === w.id) setSelected({ ...w, active: newActive });
    try {
      await fetch(`/api/widgets/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
    } catch {
      void fetchWidgets();
    }
  };

  const deleteWidget = async (id: string) => {
    if (!confirm("Delete this widget?")) return;
    try {
      await fetch(`/api/widgets/${id}`, { method: "DELETE" });
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      //
    }
  };

  const wallCode = selected
    ? `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/widget/wall.js" data-api-key="${apiKey}" data-widget-id="${selected.id}"></script>`
    : "";

  const collectCode = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/api/widget/collect.js" data-api-key="${apiKey}"></script>`;

  return (
    <div className="flex h-full">
      {/* Left panel — widget list */}
      <div
        className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col"
        style={{ background: "#0f172a" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Widgets</h2>
          <button
            onClick={() => { setShowNew(true); setSelected(null); }}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors text-white"
            style={{ background: "#0d9488" }}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* New widget form */}
        {showNew && (
          <div className="px-4 py-4 border-b border-white/10 space-y-3">
            <input
              type="text"
              placeholder="Widget name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-400 border border-white/10 focus:outline-none focus:border-teal-500"
              style={{ background: "#1e293b" }}
              autoFocus
            />
            <div className="flex gap-1">
              {(["wall", "slider", "card"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium capitalize transition-colors ${
                    newType === t
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  style={newType === t ? { background: "#0d9488" } : { background: "#1e293b" }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={createWidget}
                disabled={creating || !newName.trim()}
                className="flex-1 py-1.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: "#0d9488" }}
              >
                {creating ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setShowNew(false); setNewName(""); }}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                style={{ background: "#1e293b" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Widget list */}
        <div className="flex-1 overflow-auto py-2">
          {loading ? (
            <div className="text-center text-slate-500 py-8 text-sm">Loading…</div>
          ) : widgets.length === 0 ? (
            <div className="text-center text-slate-500 py-8 px-4">
              <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No widgets yet</p>
            </div>
          ) : (
            widgets.map((w) => (
              <div
                key={w.id}
                onClick={() => selectWidget(w)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selected?.id === w.id ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{w.name}</div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      TYPE_COLORS[w.type] ?? "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {TYPE_LABELS[w.type] ?? w.type}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(w); }}
                  className="flex-shrink-0"
                >
                  {w.active ? (
                    <ToggleRight className="w-5 h-5 text-teal-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel — config */}
      <div className="flex-1 overflow-auto p-6">
        {!selected ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Select a widget to configure it</p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Configure Widget</h2>
              <button
                onClick={() => deleteWidget(selected.id)}
                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:outline-none focus:border-teal-500"
                style={{ background: "#0f172a" }}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {(["wall", "slider", "card"] as const).map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setEditType(t)}
                    className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                      i > 0 ? "border-l border-white/10" : ""
                    } ${
                      editType === t
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                    style={editType === t ? { background: "#0d9488" } : { background: "#0f172a" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Theme</label>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {(["light", "dark", "auto"] as const).map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setEditConfig((c) => ({ ...c, theme: t }))}
                    className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                      i > 0 ? "border-l border-white/10" : ""
                    } ${
                      (editConfig.theme ?? "auto") === t
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                    style={
                      (editConfig.theme ?? "auto") === t
                        ? { background: "#0d9488" }
                        : { background: "#0f172a" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editConfig.accentColor ?? "#0d9488"}
                  onChange={(e) =>
                    setEditConfig((c) => ({ ...c, accentColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={editConfig.accentColor ?? "#0d9488"}
                  onChange={(e) =>
                    setEditConfig((c) => ({ ...c, accentColor: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:outline-none focus:border-teal-500"
                  style={{ background: "#0f172a" }}
                />
              </div>
            </div>

            {/* Max count */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Max Testimonials</label>
              <input
                type="number"
                min={1}
                max={100}
                value={editConfig.maxCount ?? 12}
                onChange={(e) =>
                  setEditConfig((c) => ({ ...c, maxCount: parseInt(e.target.value) || 12 }))
                }
                className="w-32 px-3 py-2 rounded-lg text-sm text-white border border-white/10 focus:outline-none focus:border-teal-500"
                style={{ background: "#0f172a" }}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Display Options</label>
              {[
                { key: "showRating", label: "Show Rating Stars" },
                { key: "showCompany", label: "Show Company Name" },
              ].map(({ key, label }) => {
                const val = editConfig[key as keyof WidgetConfig] as boolean | undefined;
                const isOn = val !== false; // default true
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{label}</span>
                    <button
                      onClick={() =>
                        setEditConfig((c) => ({ ...c, [key]: !isOn }))
                      }
                    >
                      {isOn ? (
                        <ToggleRight className="w-6 h-6 text-teal-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-500" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Save */}
            <button
              onClick={saveWidget}
              disabled={saving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "#0d9488" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            {/* Embed code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Embed Code</label>
              {/* Tabs */}
              <div className="flex gap-1 border-b border-white/10 mb-3">
                {(["wall", "collect"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEmbedTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      embedTab === tab
                        ? "text-teal-400 border-b-2 border-teal-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "wall" ? "Wall of Love" : "Collection Form"}
                  </button>
                ))}
              </div>
              <div
                className="rounded-lg p-3 text-xs text-slate-300 font-mono break-all relative"
                style={{ background: "#0f172a" }}
              >
                <div className="pr-20">{embedTab === "wall" ? wallCode : collectCode}</div>
                <div className="absolute top-2 right-2">
                  <CopyButton text={embedTab === "wall" ? wallCode : collectCode} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
