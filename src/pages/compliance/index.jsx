import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  Trash2,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  FileText,
  Activity,
  Plus,
  X
} from "lucide-react";

import { API_BASE_URL } from "../../config/apiConfig";

export default function AdminCompliance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCompliance, setNewCompliance] = useState({
    userId: "",
    title: "",
    description: "",
    cost: "",
    status: "Pending"
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCompliance();
    fetchUsers();
  }, []);

  async function fetchCompliance() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/compliances`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch compliance items");

      const data = await res.json();
      setItems(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleResolve(id) {
    if (!confirm("Mark this compliance item as completed?")) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/compliance/${id}/resolve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) throw new Error("Failed to resolve item");

      fetchCompliance();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddCompliance() {
    if (
      !newCompliance.userId ||
      !newCompliance.title ||
      !newCompliance.description ||
      !newCompliance.cost
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const targetUsers =
        newCompliance.userId === "all"
          ? users
          : users.filter((u) => u.id === parseInt(newCompliance.userId));

      for (const user of targetUsers) {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newItem = {
          id: Date.now() + Math.random(),
          title: newCompliance.title,
          description: newCompliance.description,
          cost: newCompliance.cost,
          status: newCompliance.status,
          formData: null,
          User: { id: user.id, fullName: user.fullName, email: user.email }
        };

        setItems((prev) => [...prev, newItem]);
      }

      alert("Compliance item added successfully");
      setShowAddModal(false);
      setNewCompliance({
        userId: "",
        title: "",
        description: "",
        cost: "",
        status: "Pending"
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this compliance item permanently?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/compliances/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to remove item");

      fetchCompliance();
    } catch (err) {
      alert(err.message);
    }
  }

  // 🔹 Group by user (like documents)
  const complianceByUser = items.reduce((acc, item) => {
    const userKey = item.User
      ? `${item.User.id}|${item.User.fullName} (${item.User.email})`
      : "unknown|Unknown User";

    if (!acc[userKey]) acc[userKey] = [];
    acc[userKey].push(item);
    return acc;
  }, {});

  const getStatusBadge = (status) => {
    const statusConfig = {
      Completed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-3.5 h-3.5" />
      },
      Pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <Clock className="w-3.5 h-3.5" />
      },
      Overdue: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />
      }
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  const toggleUserExpanded = (userKey) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userKey]: !prev[userKey]
    }));
  };

  const filteredUserGroups = Object.entries(complianceByUser).filter(
    ([userKey, userItems]) => {
      const userLabel = userKey.split("|")[1].toLowerCase();
      const matchesSearch = userLabel.includes(searchQuery.toLowerCase());

      const hasMatchingItems = userItems.some((item) => {
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        return matchesStatus;
      });

      return matchesSearch && hasMatchingItems;
    }
  );

  const getFilteredItems = (userItems) => {
    return userItems.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchesStatus;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const getTotalStats = () => {
    return {
      total: items.length,
      completed: items.filter((d) => d.status === "Completed").length,
      pending: items.filter((d) => d.status === "Pending").length,
      overdue: items.filter((d) => d.status === "Overdue").length
    };
  };

  const stats = getTotalStats();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500 font-medium">
          Loading compliance items...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="m-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Error Loading Compliance Items
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Stats */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-700 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Compliance Submissions
                </h1>
                <p className="text-red-100">
                  Monitor and manage compliance requirements across your
                  organization
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Compliance
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.overdue}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Filter className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Filter Compliance Items
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">✓ Completed</option>
              <option value="Pending">⏰ Pending</option>
              <option value="Overdue">✗ Overdue</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Active filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                  <Search className="w-3 h-3" />
                  {searchQuery}
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                  Status: {statusFilter}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Compliance Items List */}
        {filteredUserGroups.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Compliance Items Found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "No compliance submissions have been made yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUserGroups.map(([userKey, userItems]) => {
              const userLabel = userKey.split("|")[1];
              const filteredItems = getFilteredItems(userItems);
              const isExpanded = expandedUsers[userKey];

              return (
                <div
                  key={userKey}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleUserExpanded(userKey)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {userLabel.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                          {userLabel}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                          {filteredItems.length} compliance item
                          {filteredItems.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        {filteredItems.some(
                          (d) => d.status === "Completed"
                        ) && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                            {
                              filteredItems.filter(
                                (d) => d.status === "Completed"
                              ).length
                            }{" "}
                            Completed
                          </span>
                        )}
                        {filteredItems.some((d) => d.status === "Pending") && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                            {
                              filteredItems.filter(
                                (d) => d.status === "Pending"
                              ).length
                            }{" "}
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <div className="space-y-4">
                        {filteredItems.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-gray-300"
                            >
                              <div className="flex flex-col lg:flex-row gap-5">
                                <div className="rounded-xl p-4 bg-red-50 self-start">
                                  <ShieldAlert className="w-5 h-5 text-red-600" />
                                </div>

                                <div className="flex-1 min-w-0 w-full space-y-4">
                                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        {item.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 font-medium">
                                        {item.description}
                                      </p>
                                    </div>
                                    {getStatusBadge(item.status)}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      {/* < className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /> */}
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                          Cost
                                        </p>
                                        <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                                          ₦ {item.cost}
                                        </p>
                                      </div>
                                    </div>

                                    {item.formData && (
                                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                            Form Data
                                          </p>
                                          <p className="text-sm text-gray-700">
                                            {Object.keys(item.formData).length}{" "}
                                            fields submitted
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200">
                                    {item.formData && (
                                      <button
                                        onClick={() =>
                                          alert(
                                            JSON.stringify(
                                              item.formData,
                                              null,
                                              2
                                            )
                                          )
                                        }
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                      </button>
                                    )}

                                    {item.status !== "Completed" && (
                                      <button
                                        disabled={actionLoading === item.id}
                                        onClick={() => handleResolve(item.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                      >
                                        {actionLoading === item.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <CheckCircle className="w-4 h-4" />
                                        )}
                                        Mark Complete
                                      </button>
                                    )}

                                    <button
                                      disabled={actionLoading === item.id}
                                      onClick={() => handleRemove(item.id)}
                                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {actionLoading === item.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Add Compliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between z-10 rounded-t-xl">
              <h2 className="text-lg font-bold">Add New Compliance Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-red-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Select User */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Select User *
                </label>
                <select
                  value={newCompliance.userId}
                  onChange={(e) =>
                    setNewCompliance({
                      ...newCompliance,
                      userId: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Select User --</option>
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Compliance Title *
                </label>
                <input
                  type="text"
                  value={newCompliance.title}
                  onChange={(e) =>
                    setNewCompliance({
                      ...newCompliance,
                      title: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Annual Tax Filing"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Description *
                </label>
                <textarea
                  value={newCompliance.description}
                  onChange={(e) =>
                    setNewCompliance({
                      ...newCompliance,
                      description: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Describe what this compliance requirement entails..."
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Cost *
                </label>
                <input
                  type="text"
                  value={newCompliance.cost}
                  onChange={(e) =>
                    setNewCompliance({ ...newCompliance, cost: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., $500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Initial Status *
                </label>
                <select
                  value={newCompliance.status}
                  onChange={(e) =>
                    setNewCompliance({
                      ...newCompliance,
                      status: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleAddCompliance}
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-md"
                  }`}
                >
                  {isSubmitting ? "Adding..." : "Add Compliance Item"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 rounded-lg border hover:bg-gray-50 font-medium text-base transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
