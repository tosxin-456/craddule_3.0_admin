import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  FileWarning,
  Activity,
  TrendingUp
} from "lucide-react";
import { API_BASE_URL } from "../../config/apiConfig";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReviews: 0,
    flaggedDocuments: 0,
    systemEvents: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const calculateChange = (current, previous) => {
    if (previous === 0) return "+100%"; // avoid division by zero
    const diff = ((current - previous) / previous) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };


  useEffect(() => {
    async function fetchStatsAndActivities() {
      try {
        // Fetch users
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const usersData = await usersRes.json();

        // Fetch reviews
        const reviewsRes = await fetch(`${API_BASE_URL}/admin/reviews`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const reviewsData = await reviewsRes.json();

        // Fetch documents
        const documentsRes = await fetch(`${API_BASE_URL}/admin/documents`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const documentsData = await documentsRes.json();

        // Update stats
        setStats({
          totalUsers: usersData.length,
          pendingReviews: reviewsData.filter(
            (r) => r.status === "needs_fine_tuning"
          ).length,
          flaggedDocuments: documentsData.filter((d) => d.status !== "Active")
            .length,
          systemEvents: 87 // if you have logs API, replace with actual count
        });

        // Generate recent activities dynamically
        const activities = [];

        // Last 3 user onboardings
        const recentUsers = [...usersData]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3);

        recentUsers.forEach((u) => {
          if (u.onboardingStatus === "approved") {
            activities.push(`User #${u.id} approved onboarding`);
          } else if (u.onboardingStatus === "submitted") {
            activities.push(`User #${u.id} submitted onboarding`);
          } else if (u.onboardingStatus === "in_progress") {
            activities.push(`User #${u.id} is in progress`);
          }
        });

        // Last 3 flagged documents
        const flaggedDocs = documentsData
          .filter((d) => d.status !== "Active")
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3);

        flaggedDocs.forEach((d) => {
          activities.push(`Document #${d.id} flagged for review`);
        });

        // Last 3 reviews needing attention
        const pendingReviews = reviewsData
          .filter((r) => r.status === "needs_fine_tuning")
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3);

        pendingReviews.forEach((r) => {
          activities.push(`Review #${r.id} requires attention`);
        });

        // Sort by newest (based on id or updatedAt if available) and limit top 5
        activities.sort((a, b) => {
          const getId = (s) => parseInt(s.match(/#(\d+)/)[1]);
          return getId(b) - getId(a);
        });

        setRecentActivities(activities.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    }

    fetchStatsAndActivities();
  }, [token]);

  const statItems = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    //   change: "+12.5%"
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: <ShieldAlert className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
    //   change: "+5.2%"
    },
    {
      label: "Flagged Documents",
      value: stats.flaggedDocuments,
      icon: <FileWarning className="w-6 h-6" />,
      color: "from-cyan-500 to-cyan-600",
    //   change: "-2.1%"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
          alt="Dashboard Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <h1 className="text-4xl font-bold text-white mb-2">
              System Overview
            </h1>
            <p className="text-blue-100 text-lg">
              Monitor and manage your platform in real-time
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statItems.map((s, idx) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`h-2 bg-gradient-to-r ${s.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    {s.icon}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {s.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    {s.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      s.value.toLocaleString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-32">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                alt="Activity Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90" />
              <div className="absolute inset-0 flex items-center px-6">
                <h2 className="text-2xl font-bold text-white">
                  Recent Administrative Activity
                </h2>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 border border-transparent hover:border-blue-100"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-gray-700 flex-1">{act}</span>
                        <span className="text-xs text-gray-400">Just now</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-center py-8">
                      No recent activity
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-32">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80"
                alt="Quick Actions"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90" />
              <div className="absolute inset-0 flex items-center px-6">
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Review Users
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Check Documents
              </button>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg">
                System Logs
              </button>
              <button className="w-full px-4 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
