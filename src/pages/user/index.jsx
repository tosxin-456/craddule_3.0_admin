import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/apiConfig";
import * as XLSX from "xlsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: null,
    abbyUsers: null,
    usersWithDocuments: null,
    statsLoading: true
  });

  // Raw sets stored so exports can filter properly
  const [userIdsWithDocs, setUserIdsWithDocs] = useState(new Set());
  const [userIdsAbby, setUserIdsAbby] = useState(new Set());

  const USERS_PER_PAGE = 10;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const exportRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, documentsRes, reviewsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/documents`, { headers }),
        fetch(`${API_BASE_URL}/admin/reviews`, {
          headers: { ...headers, "Content-Type": "application/json" }
        })
      ]);

      let totalUsers = null;
      if (usersRes.status === "fulfilled" && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        totalUsers = Array.isArray(usersData) ? usersData.length : null;
      }

      let usersWithDocuments = null;
      if (documentsRes.status === "fulfilled" && documentsRes.value.ok) {
        const docsData = await documentsRes.value.json();
        if (Array.isArray(docsData)) {
          const ids = new Set(
            docsData
              .filter((doc) => doc.userId || doc.user?.id)
              .map((doc) => doc.userId || doc.user?.id)
          );
          usersWithDocuments = ids.size;
          setUserIdsWithDocs(ids);
        }
      }

      let abbyUsers = null;
      if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
        const reviewsData = await reviewsRes.value.json();
        if (Array.isArray(reviewsData)) {
          const uniqueReviewUserIds = new Set(
            reviewsData
              .filter((r) => r.userId || r.user?.id)
              .map((r) => r.userId || r.user?.id)
          );
          abbyUsers = uniqueReviewUserIds.size;
          setUserIdsAbby(uniqueReviewUserIds);
        }
      }

      setStats({
        totalUsers,
        abbyUsers,
        usersWithDocuments,
        statsLoading: false
      });
    } catch {
      setStats((prev) => ({ ...prev, statsLoading: false }));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.startupName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || u.onboardingStatus === filterStatus)
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const toRows = (list) =>
    list.map((user, index) => ({
      "#": index + 1,
      "Full Name": user.fullName || "",
      Email: user.email || "",
      "Phone Number": user.phoneNumber || user.phone || "",
      "Startup Name": user.startupName || "",
      Sector: user.sector || "",
      "Onboarding Status": user.onboardingStatus || ""
    }));

  const buildSheet = (rows) => {
    if (!rows.length)
      return XLSX.utils.json_to_sheet([{ Note: "No data available" }]);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0]).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length))
    }));
    return ws;
  };

  const handleExport = (type) => {
    setExportOpen(false);
    const date = new Date().toISOString().split("T")[0];
    const wb = XLSX.utils.book_new();

    if (type === "all") {
      XLSX.utils.book_append_sheet(wb, buildSheet(toRows(users)), "All Users");
      XLSX.writeFile(wb, `all_users_${date}.xlsx`);
    } else if (type === "with_documents") {
      const subset = users.filter(
        (u) => userIdsWithDocs.has(u.id) || userIdsWithDocs.has(u.userId)
      );
      XLSX.utils.book_append_sheet(
        wb,
        buildSheet(toRows(subset)),
        "Users With Documents"
      );
      XLSX.writeFile(wb, `users_with_documents_${date}.xlsx`);
    } else if (type === "abby") {
      const subset = users.filter(
        (u) => userIdsAbby.has(u.id) || userIdsAbby.has(u.userId)
      );
      XLSX.utils.book_append_sheet(
        wb,
        buildSheet(toRows(subset)),
        "Users Who Used ABBY"
      );
      XLSX.writeFile(wb, `users_abby_${date}.xlsx`);
    } else if (type === "funded") {
      // No funded users yet — export empty sheet with correct headers
      XLSX.utils.book_append_sheet(wb, buildSheet([]), "Users Funded");
      XLSX.writeFile(wb, `users_funded_${date}.xlsx`);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatsCard
            icon="👥"
            label="Total Users"
            value={stats.totalUsers}
            loading={stats.statsLoading}
            color="blue"
          />
          <StatsCard
            icon="🤖"
            label="Users Who Used ABBY"
            value={stats.abbyUsers}
            loading={stats.statsLoading}
            color="purple"
          />
          <StatsCard
            icon="📁"
            label="Users With Documents"
            value={stats.usersWithDocuments}
            loading={stats.statsLoading}
            color="green"
          />
          <StatsCard
            icon="💰"
            label="Users Funded"
            value={0}
            loading={false}
            color="orange"
          />
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Users
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage all registered users
            </p>
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              disabled={users.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              ⬇️ Export to Excel <span className="text-xs opacity-80">▾</span>
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  Select export type
                </div>

                <button
                  onClick={() => handleExport("all")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <span className="text-base">👥</span>
                  <div>
                    <div className="font-medium">All Users</div>
                    <div className="text-xs text-gray-400">
                      {users.length} users
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("with_documents")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                >
                  <span className="text-base">📁</span>
                  <div>
                    <div className="font-medium">Users With Documents</div>
                    <div className="text-xs text-gray-400">
                      {stats.usersWithDocuments ?? 0} users
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("abby")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                >
                  <span className="text-base">🤖</span>
                  <div>
                    <div className="font-medium">Users Who Used ABBY</div>
                    <div className="text-xs text-gray-400">
                      {stats.abbyUsers ?? 0} users
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport("funded")}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                >
                  <span className="text-base">💰</span>
                  <div>
                    <div className="font-medium">Users Funded</div>
                    <div className="text-xs text-gray-400">0 users</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or startup..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="needs_correction">Needs Correction</option>
            </select>
          </div>
        </div>

        {/* Users — Table on md+, Cards on mobile */}
        {currentUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {[
                      "#",
                      "Name",
                      "Email",
                      "Sector",
                      "Startup Name",
                      "Actions"
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {indexOfFirstUser + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.sector}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.startupName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden flex flex-col gap-3">
              {currentUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs text-gray-400 font-medium">
                        #{indexOfFirstUser + index + 1}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="flex-shrink-0 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                    {user.startupName && (
                      <span>
                        <span className="font-medium text-gray-400">
                          Startup:{" "}
                        </span>
                        {user.startupName}
                      </span>
                    )}
                    {user.sector && (
                      <span>
                        <span className="font-medium text-gray-400">
                          Sector:{" "}
                        </span>
                        {user.sector}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 sm:mt-6 gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 bg-white"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 text-sm border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 bg-white"
            >
              Next →
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}–
          {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
          {filteredUsers.length} users
        </div>
      </div>
    </div>
  );
}

// ─── STATS CARD ────────────────────────────────────────────────────────────────
function StatsCard({ icon, label, value, loading, color = "blue" }) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      text: "text-blue-700",
      value: "text-blue-900"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      text: "text-purple-700",
      value: "text-purple-900"
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      text: "text-green-700",
      value: "text-green-900"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      text: "text-orange-700",
      value: "text-orange-900"
    }
  };

  const c = colorMap[color];

  return (
    <div
      className={`${c.bg} ${c.border} border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm`}
    >
      <div
        className={`${c.iconBg} rounded-full p-2.5 sm:p-3 text-xl sm:text-2xl flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-xs sm:text-sm font-medium ${c.text}`}>{label}</p>
        {loading ? (
          <div className="h-6 sm:h-7 w-16 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className={`text-2xl sm:text-3xl font-bold ${c.value} mt-0.5`}>
            {value !== null && value !== undefined
              ? value.toLocaleString()
              : "—"}
          </p>
        )}
      </div>
    </div>
  );
}
