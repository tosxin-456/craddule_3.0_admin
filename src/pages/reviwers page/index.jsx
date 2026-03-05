import { useState } from "react";
import {
  UserCheck,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit3,
  X,
  Star,
  Clock,
  ChevronUp,
  ChevronDown,
  Search
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
  {
    id: "s1",
    userId: "u1",
    reviewerIds: ["r4"],
    strategyType: "go-to-market",
    duration: "60 min",
    status: "confirmed",
    scheduledAt: "2025-03-05T10:00:00Z"
  },
  {
    id: "s2",
    userId: "u2",
    reviewerIds: ["r1", "r2"],
    strategyType: "fundraising",
    duration: "90 min",
    status: "completed",
    scheduledAt: "2025-02-28T14:00:00Z"
  },
  {
    id: "s3",
    userId: "u3",
    reviewerIds: ["r2"],
    strategyType: "product",
    duration: "60 min",
    status: "pending",
    scheduledAt: null
  }
];

const MOCK_USERS = [
  { id: "u1", name: "Amara Nwosu", startup: "FarmLink Africa" },
  { id: "u2", name: "Kwame Boateng", startup: "FinOva" },
  { id: "u3", name: "Lena Fischer", startup: "HealthX" },
  { id: "u4", name: "Yemi Adeyemi", startup: "EduNow" },
  { id: "u5", name: "Chen Wei", startup: "LogistiQ" }
];

const STRATEGY_TYPES = [
  { id: "go-to-market", label: "Go-to-Market" },
  { id: "fundraising", label: "Fundraising" },
  { id: "product", label: "Product Strategy" },
  { id: "operations", label: "Operations" },
  { id: "growth", label: "Growth & Scale" }
];

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

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Avatar({ text, size = "md", color = "purple" }) {
  const sz = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
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
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function StatsCard({ icon: Icon, label, value, color = "blue" }) {
  const c = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      text: "text-blue-700",
      val: "text-blue-900"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      text: "text-purple-700",
      val: "text-purple-900"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      text: "text-green-700",
      val: "text-green-900"
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      text: "text-amber-700",
      val: "text-amber-900"
    }
  }[color];
  return (
    <div
      className={`${c.bg} ${c.border} border rounded-xl p-4 flex items-center gap-3 shadow-sm`}
    >
      <div className={`${c.iconBg} rounded-full p-2.5 flex-shrink-0`}>
        <Icon size={18} className={c.text} />
      </div>
      <div>
        <p className={`text-xs font-medium ${c.text}`}>{label}</p>
        <p className={`text-2xl font-bold ${c.val} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Reviewer Detail Modal ────────────────────────────────────────────────────
function ReviewerDetailModal({ reviewer, sessions, onClose }) {
  const revSessions = sessions.filter((s) =>
    s.reviewerIds?.includes(reviewer.id)
  );
  const stratLabel = (id) =>
    STRATEGY_TYPES.find((t) => t.id === id)?.label || id;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Reviewer Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <Avatar text={reviewer.avatar} size="lg" color="purple" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {reviewer.name}
              </h3>
              <p className="text-sm text-gray-500">{reviewer.email}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {reviewer.specialty}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  {reviewer.rating}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${reviewer.available ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}
                >
                  {reviewer.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">
                {reviewer.sessions}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Sessions</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">
                {revSessions.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Active Sessions</p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Assigned Sessions
          </h4>
          {revSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No sessions assigned yet.
            </p>
          ) : (
            <div className="space-y-2">
              {revSessions.map((s) => {
                const u = MOCK_USERS.find((x) => x.id === s.userId);
                return (
                  <div
                    key={s.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {u?.name || "—"}
                      </p>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                      <span>{u?.startup}</span>
                      {s.strategyType && (
                        <span className="text-purple-600 font-medium">
                          {stratLabel(s.strategyType)}
                        </span>
                      )}
                      <span>{fmtDate(s.scheduledAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Reviewer Modal ────────────────────────────────────────────────
function ReviewerFormModal({ reviewer, onClose, onSave }) {
  const isEdit = !!reviewer;
  const [form, setForm] = useState({
    name: reviewer?.name || "",
    email: reviewer?.email || "",
    specialty: reviewer?.specialty || "",
    rating: reviewer?.rating || 4.5,
    available: reviewer?.available ?? true
  });
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Reviewer" : "Add Reviewer"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {[
            ["Full Name", "name", "text"],
            ["Email", "email", "email"],
            ["Specialty", "specialty", "text"]
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rating (1–5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="avail"
              checked={form.available}
              onChange={(e) => set("available", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label
              htmlFor="avail"
              className="text-sm font-medium text-gray-700"
            >
              Available for sessions
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.email}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2"
          >
            <CheckCircle size={15} />
            {isEdit ? "Save Changes" : "Add Reviewer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronUp size={13} className="text-gray-300" />;
  return sortDir === "asc" ? (
    <ChevronUp size={13} className="text-blue-500" />
  ) : (
    <ChevronDown size={13} className="text-blue-500" />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewersPage() {
  const [reviewers, setReviewers] = useState([
    {
      id: "r1",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@abby.io",
      specialty: "FinTech",
      sessions: 12,
      rating: 4.9,
      avatar: "SC",
      available: true
    },
    {
      id: "r2",
      name: "Marcus Johnson",
      email: "marcus.j@abby.io",
      specialty: "HealthTech",
      sessions: 8,
      rating: 4.7,
      avatar: "MJ",
      available: true
    },
    {
      id: "r3",
      name: "Priya Kapoor",
      email: "priya.k@abby.io",
      specialty: "EdTech",
      sessions: 15,
      rating: 4.8,
      avatar: "PK",
      available: false
    },
    {
      id: "r4",
      name: "James Osei",
      email: "james.o@abby.io",
      specialty: "AgriTech",
      sessions: 6,
      rating: 4.6,
      avatar: "JO",
      available: true
    }
  ]);
  const [sessions] = useState(MOCK_SESSIONS);
  const [detailModal, setDetailModal] = useState(null);
  const [formModal, setFormModal] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterAvail, setFilterAvail] = useState("all");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const saveReviewer = (data) => {
    if (formModal === "new") {
      setReviewers((prev) => [
        ...prev,
        {
          id: `r${Date.now()}`,
          ...data,
          sessions: 0,
          avatar: data.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        }
      ]);
    } else {
      setReviewers((prev) =>
        prev.map((r) => (r.id === formModal.id ? { ...r, ...data } : r))
      );
    }
    setFormModal(null);
  };

  const filtered = reviewers
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q);
      const matchAvail =
        filterAvail === "all" ||
        (filterAvail === "available" ? r.available : !r.available);
      return matchSearch && matchAvail;
    })
    .sort((a, b) => {
      let av = a[sortKey],
        bv = b[sortKey];
      if (typeof av === "string")
        ((av = av.toLowerCase()), (bv = bv.toLowerCase()));
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const cols = [
    { key: "name", label: "Reviewer" },
    { key: "specialty", label: "Specialty" },
    { key: "available", label: "Status" },
    { key: "sessions", label: "Total Sessions" },
    // { key: "rating", label: "Rating" },
    { key: null, label: "Active Sessions" },
    { key: null, label: "Actions" }
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviewers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your strategy session reviewers
          </p>
        </div>
        <button
          onClick={() => setFormModal("new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus size={15} /> Add Reviewer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={UserCheck}
          label="Total Reviewers"
          value={reviewers.length}
          color="purple"
        />
        <StatsCard
          icon={CheckCircle}
          label="Available"
          value={reviewers.filter((r) => r.available).length}
          color="green"
        />
        <StatsCard
          icon={AlertCircle}
          label="Unavailable"
          value={reviewers.filter((r) => !r.available).length}
          color="amber"
        />
        <StatsCard
          icon={Calendar}
          label="Active Sessions"
          value={sessions.length}
          color="blue"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, specialty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {["all",
            //  "available", 
            //  "unavailable"
            ].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterAvail(opt)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                  filterAvail === opt
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {cols.map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && handleSort(key)}
                    className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${key ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}
                  >
                    <span className="flex items-center gap-1.5">
                      {label}
                      {key && (
                        <SortIcon
                          col={key}
                          sortKey={sortKey}
                          sortDir={sortDir}
                        />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm text-gray-400"
                  >
                    No reviewers match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const rSessions = sessions.filter((s) =>
                    s.reviewerIds?.includes(r.id)
                  );
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Reviewer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar text={r.avatar} size="sm" color="purple" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {r.name}
                            </p>
                            <p className="text-xs text-gray-400">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Specialty */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                          {r.specialty}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            r.available
                              ? "text-green-700 bg-green-50 border-green-200"
                              : "text-red-700 bg-red-50 border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${r.available ? "bg-green-500" : "bg-red-500"}`}
                          />
                          {r.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      {/* Total Sessions */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">
                          {r.sessions}
                        </span>
                        <span className="text-gray-400 text-xs ml-1">
                          sessions
                        </span>
                      </td>
                      {/* Active Sessions */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            rSessions.length > 0
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {rSessions.length}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailModal(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => setFormModal(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">
              {reviewers.length}
            </span>{" "}
            reviewers
          </p>
        </div>
      </div>

      {/* Modals */}
      {detailModal && (
        <ReviewerDetailModal
          reviewer={detailModal}
          sessions={sessions}
          onClose={() => setDetailModal(null)}
        />
      )}
      {formModal !== null && (
        <ReviewerFormModal
          reviewer={formModal === "new" ? null : formModal}
          onClose={() => setFormModal(null)}
          onSave={saveReviewer}
        />
      )}
    </div>
  );
}
