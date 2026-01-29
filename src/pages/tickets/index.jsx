import { useEffect, useState } from "react";
import {
  LifeBuoy,
  User,
  Mail,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  Archive
} from "lucide-react";
import { API_BASE_URL } from "../../config/apiConfig";
import toast from "react-hot-toast";

function normalizeStatus(status) {
  switch (status?.toLowerCase()) {
    case "open":
      return "Open";
    case "in_progress":
    case "under review":
      return "Under Review";
    case "resolved":
      return "Resolved";
    default:
      return "Open"; // fallback
  }
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [ticketType, setTicketType] = useState("user");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();
      console.log(result);
      // Normalize both ticket types into ONE array
      const userTickets = (result.data?.userTickets || []).map((t) => ({
        ...t,
        isPublic: false,
        status: normalizeStatus(t.status)
      }));

      const publicTickets = (result.data?.publicTickets || []).map((t) => ({
        ...t,
        isPublic: true,
        title: t.subject,
        description: t.message,
        submittedAt: t.createdAt,
        status: normalizeStatus(t.status),
        User: {
          fullName: t.name,
          email: t.email
        }
      }));

      setTickets([...userTickets, ...publicTickets]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status, isSupportTicket = false) {
    try {
      // Choose the correct route based on ticket type
      const route = isSupportTicket
        ? `${API_BASE_URL}/admin/tickets-support/${id}/status`
        : `${API_BASE_URL}/admin/tickets/${id}/status`;

      await fetch(route, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      fetchTickets();
    } catch (err) {
      toast.error("Failed to update status");
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selectedTicket) return;

    try {
      // Decide route based on ticket type
      const route = selectedTicket.isPublic
        ? "tickets-support" // public/support tickets route
        : "tickets"; // normal tickets route

      await fetch(`${API_BASE_URL}/admin/${route}/${selectedTicket.id}/reply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminReply: reply,
          senderType: "ADMIN" // backend expects this
        })
      });

      toast.success("Reply sent successfully!");
      setReply("");
      setSelectedTicket(null);
      fetchTickets(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply");
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesType =
      ticketType === "user" ? !ticket.isPublic : ticket.isPublic;

    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.User?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || ticket.status === filterStatus;

    return matchesType && matchesSearch && matchesFilter;
  });

  const scopedTickets = tickets.filter((t) =>
    ticketType === "user" ? !t.isPublic : t.isPublic
  );

  const stats = {
    total: scopedTickets.length,
    open: scopedTickets.filter((t) => t.status === "Open").length,
    underReview: scopedTickets.filter((t) => t.status === "Under Review")
      .length,
    resolved: scopedTickets.filter((t) => t.status === "Resolved").length
  };

  const statusConfig = {
    Open: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: AlertCircle
    },
    "Under Review": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock
    },
    Resolved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto" />
          <p className="text-slate-500 text-sm">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <LifeBuoy className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Support Tickets
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage and respond to customer inquiries
            </p>
          </div>
        </div>
      </div>
      {/* Ticket Type Tabs */}
      <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTicketType("user")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            ticketType === "user"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          User Tickets
        </button>

        <button
          onClick={() => setTicketType("public")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            ticketType === "public"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Public Tickets
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Total Tickets
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl">
              <LifeBuoy className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Open</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {stats.open}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Under Review</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">
                {stats.underReview}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">
                {stats.resolved}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by title, description, or user..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["All", "Open", "Under Review", "Resolved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <LifeBuoy className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 font-semibold text-lg">
              No tickets found
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery || filterStatus !== "All"
                ? "Try adjusting your search or filters"
                : "No support tickets have been submitted yet"}
            </p>
          </div>
        )}

        {filteredTickets.map((ticket) => {
          const date = new Date(ticket.submittedAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric"
            }
          );

          const status = ticket.status || "Open"; // fallback
          const statusStyle = statusConfig[status] || statusConfig["Open"];
          const StatusIcon = statusStyle.icon; // now safe

          return (
            <div
              key={ticket.id}
              className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-6">
                  {/* Left Content */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900 truncate">
                          {ticket.title}
                        </h3>
                        <p className="text-slate-600 mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-slate-700">
                          {ticket.User?.fullName || "N/A"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {ticket.User?.email || "N/A"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {date}
                      </span>
                    </div>

                    {ticket.adminReply && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                            Admin Response
                          </p>
                        </div>
                        <p className="text-sm text-indigo-900 leading-relaxed">
                          {ticket.adminReply}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status}
                    </span>

                    <div className="flex gap-2">
                      {status !== "Resolved" && (
                        <button
                          onClick={() =>
                            updateStatus(ticket.id, "Resolved", true)
                          }
                          className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="font-bold text-xl text-slate-900">
                  Reply to Ticket
                </h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Ticket from</p>
                <p className="font-semibold text-slate-900">
                  {selectedTicket.User?.fullName}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {selectedTicket.title}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response
                </label>
                <textarea
                  className="w-full border border-slate-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  rows={6}
                  placeholder="Type your response to the customer..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                className="px-5 py-2.5 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setSelectedTicket(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendReply}
                disabled={!reply.trim()}
              >
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
