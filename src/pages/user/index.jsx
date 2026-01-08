import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Ban,
  Mail,
  Phone,
  Globe,
  Briefcase,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import { API_BASE_URL } from "../../config/apiConfig";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
      console.log(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      not_started: {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Clock,
        label: "Not Started"
      },
      in_progress: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Clock,
        label: "In Progress"
      },
      submitted: {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: AlertCircle,
        label: "Submitted"
      },
      approved: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        label: "Approved"
      },
      needs_correction: {
        color: "bg-rose-100 text-rose-700 border-rose-200",
        icon: XCircle,
        label: "Needs Correction"
      }
    };
    return configs[status] || configs.not_started;
  };

  const getStageConfig = (stage) => {
    const configs = {
      Idea: {
        gradient: "from-purple-500 to-purple-600"
      },
      MVP: {
        gradient: "from-blue-500 to-blue-600"
      },
      "Early Revenue": {
        gradient: "from-emerald-500 to-emerald-600"
      }
    };
    return (
      configs[stage] || {
        gradient: "from-slate-500 to-slate-600"
      }
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.startupName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || user.onboardingStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusCounts = users.reduce((acc, user) => {
    acc[user.onboardingStatus] = (acc[user.onboardingStatus] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 md:p-8 shadow-2xl max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Error</h3>
          </div>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-6">
      {/* Fixed Header - Non-sticky on mobile, sticky on desktop */}
      <div className="bg-white border-b border-slate-200 shadow-sm md:sticky md:top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Title and Export Button */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-slate-900">
                  User Management
                </h1>
                <p className="text-slate-500 text-xs md:text-sm hidden sm:block">
                  Monitor and manage all user accounts
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl hover:shadow-lg transition-all hover:scale-105 font-medium text-sm md:text-base">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Stats Cards - Scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3 min-w-max sm:min-w-0">
              {[
                {
                  label: "Total",
                  value: users.length,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  label: "Approved",
                  value: statusCounts.approved || 0,
                  color: "from-emerald-500 to-emerald-600"
                },
                {
                  label: "In Progress",
                  value: statusCounts.in_progress || 0,
                  color: "from-amber-500 to-amber-600"
                },
                {
                  label: "Submitted",
                  value: statusCounts.submitted || 0,
                  color: "from-purple-500 to-purple-600"
                },
                {
                  label: "Review",
                  value: statusCounts.needs_correction || 0,
                  color: "from-rose-500 to-rose-600"
                }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 hover:shadow-md transition-shadow min-w-[100px] sm:min-w-0"
                >
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${stat.color} rounded-lg mb-2`}
                  >
                    <span className="text-white font-bold text-base md:text-lg">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 absolute left-3 md:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or startup..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="not_started">Not Started</option>
          </select>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 md:p-16 text-center border-2 border-dashed border-slate-300">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-base md:text-lg font-medium">
              No users found
            </p>
            <p className="text-slate-400 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredUsers.map((user) => {
              const statusConfig = getStatusConfig(user.onboardingStatus);
              const stageConfig = getStageConfig(user.stage);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header with Stage */}
                  <div
                    className={`h-1.5 md:h-2 bg-gradient-to-r ${stageConfig.gradient}`}
                  ></div>

                  <div className="p-4 md:p-6">
                    {/* User Info */}
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
                        <div
                          className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${stageConfig.gradient} rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md flex-shrink-0`}
                        >
                          {user.fullName?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-base md:text-lg truncate">
                            {user.fullName}
                          </h3>
                          <p className="text-slate-500 text-xs md:text-sm flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3 md:mb-4">
                      <div
                        className={`inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border ${statusConfig.color} text-xs md:text-sm font-medium`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5 md:gap-2">
                          <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span>Startup</span>
                        </span>
                        <span className="font-semibold text-slate-900 truncate ml-2 text-right">
                          {user.startupName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5 md:gap-2">
                          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span>Stage</span>
                        </span>
                        <span
                          className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-white text-xs font-semibold bg-gradient-to-r ${stageConfig.gradient} whitespace-nowrap`}
                        >
                          {user.stage}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-500">Industry</span>
                        <span className="text-slate-700 font-medium truncate ml-2 text-right">
                          {user.industry}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5 md:gap-2">
                          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span>Phone</span>
                        </span>
                        <span className="text-slate-700 truncate ml-2 text-right">
                          {user.phoneNumber}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5 md:gap-2">
                          <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span>Country</span>
                        </span>
                        <span className="text-slate-700 truncate ml-2 text-right">
                          {user.country}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 md:pt-4 border-t border-slate-100">
                      <button className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg md:rounded-xl hover:shadow-lg transition-all hover:scale-105 font-medium text-xs md:text-sm">
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-100 text-slate-700 rounded-lg md:rounded-xl hover:bg-slate-200 transition-all font-medium text-xs md:text-sm">
                        <Ban className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
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
