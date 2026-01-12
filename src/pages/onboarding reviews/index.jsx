import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Filter
} from "lucide-react";
import { API_BASE_URL } from "../../config/apiConfig";
import toast from "react-hot-toast";

export default function AdminOnboarding() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch onboarding reviews");
      }

      const data = await res.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function normalizeSuggestions(suggestions) {
    if (Array.isArray(suggestions)) return suggestions;
    if (typeof suggestions === "string") {
      try {
        const parsed = JSON.parse(suggestions);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  async function handleDecision(reviewId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        throw new Error("Failed to update review");
      }

      // Refresh list after decision
      fetchReviews();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "ok").length,
    needsWork: reviews.filter((r) => r.status === "needs_fine_tuning").length
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "ok", label: "Approved" },
    { value: "needs_fine_tuning", label: "Needs Work" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading reviews…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-rose-700 flex items-start gap-3 sm:gap-4">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1 text-sm sm:text-base">
                Error Loading Reviews
              </h3>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
              Onboarding Reviews
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Review and manage startup onboarding submissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
                    Total
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-amber-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
                    Pending
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-emerald-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
                    Approved
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {stats.approved}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-rose-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">
                    Needs Work
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-600">
                    {stats.needsWork}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Desktop */}
          <div className="hidden sm:flex gap-2 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filters - Mobile Dropdown */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {filterOptions.find((f) => f.value === filter)?.label ||
                  "Filter"}
              </span>
              <span className="text-slate-400">▼</span>
            </button>

            {showFilterMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-10 overflow-hidden">
                {filterOptions.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFilter(f.value);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition ${
                      filter === f.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl sm:rounded-2xl p-12 sm:p-16 text-center">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-base sm:text-lg">
              No reviews found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredReviews.map((review) => {
              const parsedSuggestions = normalizeSuggestions(
                review.suggestions
              );

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Header Bar */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* User Info & Score */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">User ID</p>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                              {review.userId}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 ${getScoreBg(
                            review.score
                          )}`}
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${getScoreColor(
                                review.score
                              )}`}
                            />
                            <div>
                              <p className="text-xs text-slate-600">Score</p>
                              <p
                                className={`text-xl sm:text-2xl font-bold ${getScoreColor(
                                  review.score
                                )}`}
                              >
                                {review.score}
                                <span className="text-xs sm:text-sm">/100</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center px-3 sm:px-4">
                          <p className="text-xs text-slate-500 mb-1">Version</p>
                          <div className="px-2 sm:px-3 py-1 bg-slate-200 rounded-md sm:rounded-lg">
                            <p className="text-xs sm:text-sm font-semibold text-slate-700">
                              v{review.version}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {review.status === "pending" && (
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => handleDecision(review.id, "ok")}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg sm:rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">✓</span>
                          </button>

                          <button
                            onClick={() =>
                              handleDecision(review.id, "needs_fine_tuning")
                            }
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-600 text-white text-sm font-medium rounded-lg sm:rounded-xl hover:bg-amber-700 transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden lg:inline">Needs Work</span>
                            <span className="lg:hidden">⚠</span>
                          </button>
                        </div>
                      )}

                      {review.status !== "pending" && (
                        <div
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm text-center ${
                            review.status === "ok"
                              ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
                              : "bg-amber-100 text-amber-700 border-2 border-amber-200"
                          }`}
                        >
                          {review.status === "ok"
                            ? "✓ Approved"
                            : "⚠ Needs Work"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 space-y-4 sm:space-y-6">
                    {/* Feedback */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                          Feedback
                        </h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base pl-0 sm:pl-7">
                        {review.feedback}
                      </p>
                    </div>

                    {/* Suggestions */}
                    {parsedSuggestions.length > 0 && (
                      <div className="bg-amber-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-amber-200">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                            Suggestions
                          </h3>
                        </div>
                        <ul className="space-y-2 sm:space-y-3">
                          {parsedSuggestions.map((s, i) => (
                            <li key={i} className="flex gap-2 sm:gap-3">
                              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                                {i + 1}
                              </span>
                              <span className="text-slate-700 text-sm sm:text-base pt-0.5">
                                {s}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
