import { useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit3,
  X,
  Search,
  MessageSquare,
  Calendar,
  Tag,
  Timer,
  ChevronDown,
  ChevronUp,
  Minus,
  Star,
  UserCheck,
  UserX,
  Eye
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
    rating: 4.9,
    sessionsCompleted: 42,
    bio: "Former Goldman Sachs VP with 12 years in fintech. Specialized in payment systems, lending platforms, and regulatory compliance across APAC and EMEA markets.",
    expertise: [
      "Seed Fundraising",
      "Financial Modelling",
      "Regulatory Compliance",
      "Go-to-Market"
    ],
    email: "s.chen@reviewers.io"
  },
  {
    id: "r2",
    name: "Marcus Johnson",
    avatar: "MJ",
    specialty: "HealthTech",
    available: true,
    rating: 4.7,
    sessionsCompleted: 31,
    bio: "Co-founder of two successful healthtech exits. Deep expertise in clinical workflow digitization, telehealth, and navigating FDA/CE certification processes.",
    expertise: [
      "Product Strategy",
      "Regulatory Strategy",
      "B2B Sales",
      "Series A Prep"
    ],
    email: "m.johnson@reviewers.io"
  },
  {
    id: "r3",
    name: "Priya Kapoor",
    avatar: "PK",
    specialty: "EdTech",
    available: false,
    rating: 4.8,
    sessionsCompleted: 58,
    bio: "Backed 20+ edtech startups as a partner at Learn Ventures. Expert in curriculum design partnerships, LMS integrations, and emerging-market distribution strategies.",
    expertise: [
      "Growth Strategy",
      "Curriculum Partnerships",
      "User Acquisition",
      "Operations"
    ],
    email: "p.kapoor@reviewers.io"
  },
  {
    id: "r4",
    name: "James Osei",
    avatar: "JO",
    specialty: "AgriTech",
    available: true,
    rating: 4.6,
    sessionsCompleted: 27,
    bio: "Built and scaled AgriConnect across 6 African markets. Focuses on smallholder farmer tech, supply chain traceability, and climate-resilient agriculture models.",
    expertise: [
      "Africa Market Entry",
      "Supply Chain",
      "Go-to-Market",
      "Impact Investment"
    ],
    email: "j.osei@reviewers.io"
  }
];

const MOCK_USERS = [
  {
    id: "u1",
    name: "Amara Nwosu",
    email: "amara@startup.io",
    startup: "FarmLink Africa",
    sector: "AgriTech",
    message:
      "I'd love a strategy session to refine our go-to-market approach for Q2.",
    createdAt: "2025-02-20T10:00:00Z"
  },
  {
    id: "u2",
    name: "Kwame Boateng",
    email: "kwame@finova.com",
    startup: "FinOva",
    sector: "FinTech",
    message:
      "Looking for help structuring our seed round pitch deck and financial projections.",
    createdAt: "2025-02-22T14:30:00Z"
  },
  {
    id: "u3",
    name: "Lena Fischer",
    email: "lena@healthx.de",
    startup: "HealthX",
    sector: "HealthTech",
    message:
      "Need guidance on regulatory compliance and go-to-market for European markets.",
    createdAt: "2025-02-24T09:15:00Z"
  },
  {
    id: "u4",
    name: "Yemi Adeyemi",
    email: "yemi@edunow.ng",
    startup: "EduNow",
    sector: "EdTech",
    message:
      "Want to discuss scaling our user acquisition strategy and product roadmap.",
    createdAt: "2025-02-26T11:00:00Z"
  },
  {
    id: "u5",
    name: "Chen Wei",
    email: "wei@logistiq.cn",
    startup: "LogistiQ",
    sector: "Logistics",
    message:
      "Strategy session needed for Series A preparation and investor targeting.",
    createdAt: "2025-02-28T16:45:00Z"
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
    notes: "",
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
    notes: "",
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
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";
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
    lg: "w-12 h-12 text-base"
  }[size];
  const cl = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700"
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

// ─── Reviewers Popup ──────────────────────────────────────────────────────────
function ReviewersPopup({ reviewers, onClose }) {
  const AVATAR_COLORS = ["purple", "blue", "green", "rose"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-100 rounded-lg p-1.5">
              <Users size={15} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Assigned Reviewers
              </h2>
              <p className="text-xs text-gray-400">
                {reviewers.length} reviewer{reviewers.length !== 1 ? "s" : ""}{" "}
                on this session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* Reviewer Cards */}
        <div className="p-4 space-y-3">
          {reviewers.map((r, i) => (
            <div
              key={r.id}
              className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all"
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                <Avatar
                  text={r.avatar}
                  size="lg"
                  color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-gray-900">
                      {r.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${r.available ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}
                    >
                      {r.available ? (
                        <UserCheck size={10} />
                      ) : (
                        <UserX size={10} />
                      )}
                      {r.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-purple-600 font-semibold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                      {r.specialty}
                    </span>
                    {/* <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                      <Star
                        size={10}
                        className="fill-amber-400 text-amber-400"
                      />
                      {r.rating}
                    </span> */}
                    <span className="text-xs text-gray-400">
                      {r.sessionsCompleted} sessions
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{r.email}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                {r.bio}
              </p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {r.expertise.map((e) => (
                  <span
                    key={e}
                    className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-medium"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Session Modal ────────────────────────────────────────────────────────────
function SessionModal({ session, preUserId, onClose, onSave }) {
  const isNew = !session;
  const [userId, setUserId] = useState(session?.userId || preUserId || "");
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
                <p className="mt-1 text-blue-600 italic">
                  "{user.message?.slice(0, 100)}…"
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

// ─── Expanded Row ─────────────────────────────────────────────────────────────
function ExpandedRow({ user, session, reviewers, onAssign, onUpdate }) {
  return (
    <tr className="bg-blue-50/40 border-b border-blue-100">
      <td colSpan={9} className="px-5 py-3">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <MessageSquare
                size={13}
                className="text-blue-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-gray-600 italic">"{user.message}"</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Requested on {fmtDate(user.createdAt)}
            </p>
          </div>
          <div className="flex-shrink-0">
            {session ? (
              <div className="flex flex-wrap items-center gap-2">
                <StrategyBadge typeId={session.strategyType} />
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 border border-gray-200 bg-white rounded-full px-2 py-0.5">
                  <Timer size={10} />
                  {session.duration}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {fmtDateTime(session.scheduledAt)}
                </span>
                <button
                  onClick={onUpdate}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Edit3 size={11} />
                  Update
                </button>
              </div>
            ) : (
              <button
                onClick={onAssign}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={12} />
                Assign Session
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserRequestsPage() {
  const [sessions, setSessions] = useState(INIT_SESSIONS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [preUserId, setPreUserId] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [reviewersPopup, setReviewersPopup] = useState(null); // array of reviewer objects

  const toggleRow = (id) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = MOCK_USERS.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.startup.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = (userId) => {
    setPreUserId(userId);
    setModal("new");
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
    setPreUserId(null);
  };

  const assigned = MOCK_USERS.filter((u) =>
    sessions.some((s) => s.userId === u.id)
  ).length;
  const unassigned = MOCK_USERS.length - assigned;

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Requests</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Review and assign strategy sessions for each user
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Users,
            label: "Total Users",
            value: MOCK_USERS.length,
            color: "blue"
          },
          {
            icon: CheckCircle,
            label: "Assigned",
            value: assigned,
            color: "green"
          },
          {
            icon: Clock,
            label: "Unassigned",
            value: unassigned,
            color: "amber"
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="relative max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users or startups…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "",
                  "User",
                  "Startup",
                  "Sector",
                  "Requested",
                  "Session",
                  "Reviewers",
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
              {filtered.map((u) => {
                const session = sessions.find((s) => s.userId === u.id);
                const reviewers = session
                  ? MOCK_REVIEWERS.filter((r) =>
                      session.reviewerIds?.includes(r.id)
                    )
                  : [];
                const expanded = expandedRows.has(u.id);

                return [
                  <tr
                    key={u.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${expanded ? "bg-gray-50/40" : ""}`}
                  >
                    {/* Expand toggle */}
                    <td className="px-4 py-3 w-8">
                      <button
                        onClick={() => toggleRow(u.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </td>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          text={initials(u.name)}
                          size="sm"
                          color="blue"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Startup */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {u.startup}
                      </span>
                    </td>
                    {/* Sector */}
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {u.sector}
                    </td>
                    {/* Requested */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(u.createdAt)}
                    </td>
                    {/* Session */}
                    <td className="px-4 py-3">
                      {session ? (
                        <StrategyBadge typeId={session.strategyType} />
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Minus size={10} />
                          Not assigned
                        </span>
                      )}
                    </td>
                    {/* Reviewers — NEW COLUMN */}
                    <td className="px-4 py-3">
                      {reviewers.length > 0 ? (
                        <button
                          onClick={() => setReviewersPopup(reviewers)}
                          className="flex items-center gap-2 group"
                        >
                          {/* Stacked avatars */}
                          <div className="flex -space-x-2">
                            {reviewers.slice(0, 3).map((r, i) => (
                              <div
                                key={r.id}
                                title={r.name}
                                className="ring-2 ring-white rounded-full"
                              >
                                <Avatar
                                  text={r.avatar}
                                  size="sm"
                                  color={["purple", "blue", "green"][i % 3]}
                                />
                              </div>
                            ))}
                            {reviewers.length > 3 && (
                              <div className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                +{reviewers.length - 3}
                              </div>
                            )}
                          </div>
                          {/* View button */}
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg group-hover:bg-purple-100 transition-colors whitespace-nowrap">
                            <Eye size={10} />
                            View
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Minus size={10} />
                          None
                        </span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      {session ? (
                        <StatusBadge status={session.status} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    {/* Action */}
                    <td className="px-4 py-3">
                      {session ? (
                        <button
                          onClick={() => setModal(session)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Edit3 size={11} />
                          Update
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssign(u.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Plus size={11} />
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>,
                  expanded && (
                    <ExpandedRow
                      key={`${u.id}-exp`}
                      user={u}
                      session={session}
                      reviewers={reviewers}
                      onAssign={() => handleAssign(u.id)}
                      onUpdate={() => setModal(session)}
                    />
                  )
                ];
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm">
            No users found.
          </div>
        )}
      </div>

      {/* Reviewers Popup */}
      {reviewersPopup && (
        <ReviewersPopup
          reviewers={reviewersPopup}
          onClose={() => setReviewersPopup(null)}
        />
      )}

      {/* Session Modal */}
      {modal !== null && (
        <SessionModal
          session={modal === "new" ? null : modal}
          preUserId={modal === "new" ? preUserId : null}
          onClose={() => {
            setModal(null);
            setPreUserId(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}
