import { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Plus,
  Edit3,
  X,
  Search,
  Tag,
  Timer
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STRATEGY_TYPES = [
  {
    id: "go-to-market",
    label: "Go-to-Market",
    color: "text-violet-700 bg-violet-50 border-violet-200"
  },
  {
    id: "fundraising",
    label: "Fundraising",
    color: "text-blue-700 bg-blue-50 border-blue-200"
  },
  {
    id: "product",
    label: "Product Strategy",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200"
  },
  {
    id: "operations",
    label: "Operations",
    color: "text-amber-700 bg-amber-50 border-amber-200"
  },
  {
    id: "growth",
    label: "Growth & Scale",
    color: "text-rose-700 bg-rose-50 border-rose-200"
  }
];

const DURATION_OPTIONS = ["30 min", "60 min", "90 min", "120 min"];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: Clock
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: CheckCircle
  },
  completed: {
    label: "Completed",
    color: "text-green-700 bg-green-50 border-green-200",
    icon: CheckCircle
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700 bg-red-50 border-red-200",
    icon: AlertCircle
  }
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_REVIEWERS = [
  {
    id: "r1",
    name: "Dr. Sarah Chen",
    avatar: "SC",
    specialty: "FinTech",
    available: true,
    rating: 4.9
  },
  {
    id: "r2",
    name: "Marcus Johnson",
    avatar: "MJ",
    specialty: "HealthTech",
    available: true,
    rating: 4.7
  },
  {
    id: "r3",
    name: "Priya Kapoor",
    avatar: "PK",
    specialty: "EdTech",
    available: false,
    rating: 4.8
  },
  {
    id: "r4",
    name: "James Osei",
    avatar: "JO",
    specialty: "AgriTech",
    available: true,
    rating: 4.6
  }
];

const MOCK_USERS = [
  {
    id: "u1",
    name: "Amara Nwosu",
    email: "amara@startup.io",
    startup: "FarmLink Africa",
    sector: "AgriTech"
  },
  {
    id: "u2",
    name: "Kwame Boateng",
    email: "kwame@finova.com",
    startup: "FinOva",
    sector: "FinTech"
  },
  {
    id: "u3",
    name: "Lena Fischer",
    email: "lena@healthx.de",
    startup: "HealthX",
    sector: "HealthTech"
  },
  {
    id: "u4",
    name: "Yemi Adeyemi",
    email: "yemi@edunow.ng",
    startup: "EduNow",
    sector: "EdTech"
  },
  {
    id: "u5",
    name: "Chen Wei",
    email: "wei@logistiq.cn",
    startup: "LogistiQ",
    sector: "Logistics"
  }
];

const INIT_SESSIONS = [
  {
    id: "s1",
    userId: "u1",
    reviewerIds: ["r4"],
    strategyType: "go-to-market",
    duration: "60 min",
    status: "confirmed",
    scheduledAt: "2025-03-05T10:00:00Z",
    notes: "Focus on distribution channels in West Africa.",
    createdAt: "2025-02-21T08:00:00Z"
  },
  {
    id: "s2",
    userId: "u2",
    reviewerIds: ["r1", "r2"],
    strategyType: "fundraising",
    duration: "90 min",
    status: "completed",
    scheduledAt: "2025-02-28T14:00:00Z",
    notes: "Pitch deck reviewed. Needs stronger unit economics.",
    createdAt: "2025-02-23T09:00:00Z"
  },
  {
    id: "s3",
    userId: "u3",
    reviewerIds: ["r2"],
    strategyType: "product",
    duration: "60 min",
    status: "pending",
    scheduledAt: null,
    notes: "",
    createdAt: "2025-02-24T10:00:00Z"
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Not scheduled";
const initials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "?";

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Avatar({ text, size = "md", color = "blue" }) {
  const sz = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base"
  }[size];
  const cl = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700"
  }[color];
  return (
    <div
      className={`${sz} ${cl} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
    >
      {text}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function StrategyBadge({ typeId }) {
  const t = STRATEGY_TYPES.find((s) => s.id === typeId);
  if (!t) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${t.color}`}
    >
      <Tag size={9} />
      {t.label}
    </span>
  );
}

// ─── Session Modal ────────────────────────────────────────────────────────────
function SessionModal({ session, onClose, onSave }) {
  const isNew = !session;
  const [userId, setUserId] = useState(session?.userId || "");
  const [reviewerIds, setReviewerIds] = useState(session?.reviewerIds || []);
  const [strategyType, setStrategy] = useState(session?.strategyType || "");
  const [duration, setDuration] = useState(session?.duration || "60 min");
  const [scheduledAt, setScheduled] = useState(
    session?.scheduledAt ? session.scheduledAt.slice(0, 16) : ""
  );
  const [notes, setNotes] = useState(session?.notes || "");
  const [status, setStatus] = useState(session?.status || "pending");

  const toggleReviewer = (id) =>
    setReviewerIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  const user = MOCK_USERS.find((u) => u.id === userId);
  const canSave = userId && reviewerIds.length > 0 && strategyType;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isNew ? "Assign Strategy Session" : "Update Strategy Session"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isNew
                ? "Connect a user to one or more reviewers"
                : `Session ID: ${session.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* User */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              User <span className="text-red-500">*</span>
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user…</option>
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.startup}
                </option>
              ))}
            </select>
            {user && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
                <p className="font-semibold">
                  {user.startup} · {user.sector}
                </p>
              </div>
            )}
          </div>

          {/* Strategy Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Strategy Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STRATEGY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStrategy(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${strategyType === t.id ? t.color + " ring-2 ring-offset-1 ring-blue-300" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${duration === d ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Reviewers */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reviewers <span className="text-red-500">*</span>{" "}
              <span className="text-gray-400 font-normal">
                (select one or more)
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOCK_REVIEWERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleReviewer(r.id)}
                  disabled={!r.available}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${reviewerIds.includes(r.id) ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"} ${!r.available ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Avatar text={r.avatar} size="sm" color="purple" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.specialty} · ⭐ {r.rating}
                    </p>
                    {!r.available && (
                      <span className="text-xs text-red-500 font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {reviewerIds.includes(r.id) && (
                    <CheckCircle
                      size={14}
                      className="text-blue-500 flex-shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Schedule Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduled(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add session notes or instructions…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                userId,
                reviewerIds,
                strategyType,
                duration,
                scheduledAt: scheduledAt || null,
                notes,
                status
              })
            }
            disabled={!canSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5"
          >
            {isNew ? (
              <>
                <Plus size={13} />
                Assign Session
              </>
            ) : (
              <>
                <CheckCircle size={13} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StrategyPage() {
  const [sessions, setSessions] = useState(INIT_SESSIONS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFStatus] = useState("all");
  const [filterType, setFType] = useState("all");
  const [modal, setModal] = useState(null);

  const filtered = sessions.filter((s) => {
    const u = MOCK_USERS.find((x) => x.id === s.userId);
    const matchSearch =
      !search ||
      u?.name.toLowerCase().includes(search.toLowerCase()) ||
      u?.startup.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchType = filterType === "all" || s.strategyType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: sessions.length,
    pending: sessions.filter((s) => s.status === "pending").length,
    confirmed: sessions.filter((s) => s.status === "confirmed").length,
    completed: sessions.filter((s) => s.status === "completed").length
  };

  const save = (data) => {
    if (modal === "new") {
      setSessions((prev) => [
        ...prev,
        { id: `s${Date.now()}`, ...data, createdAt: new Date().toISOString() }
      ]);
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === modal.id ? { ...s, ...data } : s))
      );
    }
    setModal(null);
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Strategy Sessions</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Assign, manage, and track all strategy sessions
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus size={13} />
          Assign Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Calendar,
            label: "Total Sessions",
            value: stats.total,
            color: "blue"
          },
          {
            icon: Clock,
            label: "Pending",
            value: stats.pending,
            color: "amber"
          },
          {
            icon: CheckCircle,
            label: "Confirmed",
            value: stats.confirmed,
            color: "blue"
          },
          {
            icon: BookOpen,
            label: "Completed",
            value: stats.completed,
            color: "green"
          }
        ].map(({ icon: Icon, label, value, color }) => {
          const c = {
            blue: {
              bg: "bg-blue-50",
              border: "border-blue-200",
              ib: "bg-blue-100",
              t: "text-blue-700",
              v: "text-blue-900"
            },
            green: {
              bg: "bg-green-50",
              border: "border-green-200",
              ib: "bg-green-100",
              t: "text-green-700",
              v: "text-green-900"
            },
            amber: {
              bg: "bg-amber-50",
              border: "border-amber-200",
              ib: "bg-amber-100",
              t: "text-amber-700",
              v: "text-amber-900"
            }
          }[color];
          return (
            <div
              key={label}
              className={`${c.bg} ${c.border} border rounded-xl p-3 flex items-center gap-3 shadow-sm`}
            >
              <div className={`${c.ib} rounded-full p-2 flex-shrink-0`}>
                <Icon size={16} className={c.t} />
              </div>
              <div>
                <p className={`text-xs font-medium ${c.t}`}>{label}</p>
                <p className={`text-2xl font-bold ${c.v}`}>{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or startup…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="sm:w-36 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFType(e.target.value)}
          className="sm:w-44 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Strategy Types</option>
          {STRATEGY_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No sessions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "#",
                    "User / Startup",
                    "Strategy Type",
                    "Duration",
                    "Reviewers",
                    "Scheduled",
                    "Status",
                    ""
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const u = MOCK_USERS.find((x) => x.id === s.userId);
                  const sReviewers = MOCK_REVIEWERS.filter((r) =>
                    s.reviewerIds?.includes(r.id)
                  );
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0"
                    >
                      {/* # */}
                      <td className="px-4 py-3.5 text-xs text-gray-400 font-medium">
                        {i + 1}
                      </td>
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            text={initials(u?.name)}
                            size="sm"
                            color="blue"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {u?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {u?.startup} · {u?.sector}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Strategy */}
                      <td className="px-4 py-3.5">
                        <StrategyBadge typeId={s.strategyType} />
                      </td>
                      {/* Duration */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                          <Timer size={10} />
                          {s.duration}
                        </span>
                      </td>
                      {/* Reviewers */}
                      <td className="px-4 py-3.5">
                        {sReviewers.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5">
                              {sReviewers.map((r) => (
                                <div key={r.id} title={r.name}>
                                  <Avatar
                                    text={r.avatar}
                                    size="sm"
                                    color="purple"
                                  />
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 hidden lg:inline whitespace-nowrap">
                              {sReviewers
                                .map((r) => r.name.split(" ")[0])
                                .join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      {/* Scheduled */}
                      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {fmtDateTime(s.scheduledAt)}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setModal(s)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Edit3 size={11} />
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <SessionModal
          session={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
