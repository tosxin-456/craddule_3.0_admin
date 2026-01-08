import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  Activity,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Lock,
  Sparkles
} from "lucide-react";
import logo from "../assets/logo.png";

export default function AdminConsoleLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white/95 backdrop-blur-xl border-r border-blue-100 flex flex-col
          shadow-xl shadow-blue-500/5
          transform transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo with Gradient Background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80')] opacity-10 bg-cover" />
          <div className="relative p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white backdrop-blur-sm flex items-center justify-center">
                <img src={logo} className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Craddule</p>
                <p className="text-xs text-blue-100">Admin Console</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <NavSection label="Overview">
            <AdminLink
              to="/admin/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
            {/* <AdminLink
              to="/admin/activity"
              label="System Activity"
              icon={<Activity className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            /> */}
          </NavSection>

          <NavSection label="User Management">
            <AdminLink
              to="/admin/users"
              label="Users"
              icon={<Users className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
            <AdminLink
              to="/admin/onboarding"
              label="Onboarding Reviews"
              icon={<ShieldCheck className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
          </NavSection>

          <NavSection label="Content & Compliance">
            <AdminLink
              to="/admin/documents"
              label="Documents Review"
              icon={<FileSearch className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
            <AdminLink
              to="/admin/compliance"
              label="Compliance Flags"
              icon={<Lock className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
          </NavSection>

          <NavSection label="Support">
            <AdminLink
              to="/admin/tickets"
              label="Support Tickets"
              icon={<MessageSquare className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
          </NavSection>

          <NavSection label="System">
            <AdminLink
              to="/admin/settings"
              label="Platform Settings"
              icon={<Settings className="w-5 h-5" />}
              onNavigate={() => setSidebarOpen(false)}
            />
          </NavSection>
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-3 border-t border-blue-100 bg-gradient-to-b from-transparent to-blue-50/50">
          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">
              🔒 Secure Session
            </p>
            <p className="text-xs text-blue-600 mt-1">All actions are logged</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
              px-4 py-3 text-sm font-semibold
              text-red-600 bg-red-50 border border-red-200 rounded-xl
              hover:bg-red-100 hover:border-red-300 transition-all duration-200
              shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">
              Admin Console
            </span>
          </div>
          <div className="w-10" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function NavSection({ label, children }) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function AdminLink({ to, label, icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `group w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <span
              className={`transition-transform duration-200 ${
                isActive
                  ? "text-white scale-110"
                  : "text-blue-500 group-hover:text-blue-600"
              }`}
            >
              {icon}
            </span>
            <span>{label}</span>
          </div>

          {isActive && <ChevronRight className="w-4 h-4 animate-pulse" />}
        </>
      )}
    </NavLink>
  );
}
