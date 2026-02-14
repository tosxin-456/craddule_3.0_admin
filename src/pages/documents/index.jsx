import { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Plus,
  X,
  Building2,
  Shield,
  Receipt,
  Search,
  Download,
  Clock,
  AlertCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  User,
  Layers,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { API_BASE_URL, IMAGE_URL } from "../../config/apiConfig";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 10;

const documentTypeConfig = {
  "CAC Certificate": {
    icon: <Building2 className="w-3.5 h-3.5" />,
    badgeBg: "bg-sky-100",
    textColor: "text-sky-700",
    dot: "bg-sky-500"
  },
  "Industry License": {
    icon: <Shield className="w-3.5 h-3.5" />,
    badgeBg: "bg-violet-100",
    textColor: "text-violet-700",
    dot: "bg-violet-500"
  },
  "Tax Identification Number": {
    icon: <Receipt className="w-3.5 h-3.5" />,
    badgeBg: "bg-emerald-100",
    textColor: "text-emerald-700",
    dot: "bg-emerald-500"
  },
  "Tax Clearance Certificate": {
    icon: <FileText className="w-3.5 h-3.5" />,
    badgeBg: "bg-amber-100",
    textColor: "text-amber-700",
    dot: "bg-amber-500"
  },
  Other: {
    icon: <FileText className="w-3.5 h-3.5" />,
    badgeBg: "bg-slate-100",
    textColor: "text-slate-600",
    dot: "bg-slate-400"
  }
};

const statusConfig = {
  Active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: <CheckCircle className="w-3 h-3" />
  },
  "Expiring Soon": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: <Clock className="w-3 h-3" />
  },
  Expired: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: <XCircle className="w-3 h-3" />
  }
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Active;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

function DocTypePill({ type }) {
  const cfg = documentTypeConfig[type] || documentTypeConfig.Other;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.textColor} whitespace-nowrap`}
    >
      {cfg.icon}
      {type}
    </span>
  );
}

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column)
    return (
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    );
  return sortConfig.direction === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;
    let last;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        if (last && i - last > 1) pages.push("...");
        pages.push(i);
        last = i;
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev
      </button>
      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-1.5 py-1.5 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  const [newDocument, setNewDocument] = useState({
    userId: "",
    type: "CAC Certificate",
    fullName: "",
    grants: "",
    expiry: "",
    issueDate: "",
    documentNumber: "",
    targetType: "user",
    sector: ""
  });

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, sectorFilter]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
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

  async function handleAddDocument() {
    if (
      !newDocument.type ||
      !newDocument.fullName ||
      !newDocument.grants ||
      !newDocument.issueDate ||
      !newDocument.documentNumber ||
      !selectedFile
    ) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }
    if (newDocument.targetType === "user" && !newDocument.userId) {
      toast.error("Please select a user");
      return;
    }
    if (newDocument.targetType === "sector" && !newDocument.sector) {
      toast.error("Please select a sector");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("targetType", newDocument.targetType);
      if (newDocument.targetType === "user")
        formData.append("userId", newDocument.userId);
      if (newDocument.targetType === "sector")
        formData.append("sector", newDocument.sector);
      formData.append("name", newDocument.type);
      formData.append("fullName", newDocument.fullName);
      formData.append("grants", newDocument.grants);
      formData.append("expiryDate", newDocument.expiry || "");
      formData.append("issueDate", newDocument.issueDate);
      formData.append("documentNumber", newDocument.documentNumber);
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE_URL}/admin/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add document");

      toast.success(data.message);
      setShowAddModal(false);
      setSelectedFile(null);
      resetForm();
      fetchDocuments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteDocument(docId) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      setActionLoading(docId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete document");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function resetForm() {
    setNewDocument({
      userId: "",
      type: "CAC Certificate",
      fullName: "",
      grants: "",
      expiry: "",
      issueDate: "",
      documentNumber: "",
      targetType: "user",
      sector: ""
    });
  }

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  }

  const getUniqueSectors = () => {
    const sectors = users.map((u) => u.sector).filter(Boolean);
    return [...new Set(sectors)].sort();
  };
  const uniqueSectors = getUniqueSectors();

  const enrichedDocs = documents.map((doc) => {
    const user = users.find((u) => u.id === doc.userId);
    return {
      ...doc,
      user: user || { fullName: "Unknown User", email: "", sector: "" }
    };
  });

  const filteredDocs = enrichedDocs.filter((doc) => {
    const searchTarget =
      `${doc.user.fullName} ${doc.user.email} ${doc.fullName} ${doc.documentNumber} ${doc.name}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.name === typeFilter;
    const matchesSector =
      sectorFilter === "all" || doc.user.sector === sectorFilter;
    return matchesSearch && matchesStatus && matchesType && matchesSector;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = "";
    let bVal = "";
    if (sortConfig.key === "owner") {
      aVal = a.user.fullName;
      bVal = b.user.fullName;
    } else if (sortConfig.key === "sector") {
      aVal = a.user.sector;
      bVal = b.user.sector;
    } else {
      aVal = a[sortConfig.key] || "";
      bVal = b[sortConfig.key] || "";
    }
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortConfig.direction === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sortedDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = sortedDocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilterCount = [
    statusFilter !== "all",
    typeFilter !== "all",
    sectorFilter !== "all"
  ].filter(Boolean).length;

  const stats = {
    total: documents.length,
    active: documents.filter((d) => d.status === "Active").length,
    expiring: documents.filter((d) => d.status === "Expiring Soon").length,
    expired: documents.filter((d) => d.status === "Expired").length
  };

  const columns = [
    { key: "fullName", label: "Document / Number", sortable: true },
    { key: "name", label: "Type", sortable: true },
    { key: "owner", label: "Owner", sortable: true },
    { key: "sector", label: "Sector", sortable: true },
    { key: "issueDate", label: "Issued", sortable: true },
    { key: "expiryDate", label: "Expires", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "actions", label: "Actions", sortable: false }
  ];

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Loading documents…</p>
      </div>
    );

  if (error)
    return (
      <div className="m-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-900 font-semibold mb-1">
              Error Loading Documents
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Documents
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredDocs.length} of {documents.length} documents
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "text-slate-700",
              icon: <Layers className="w-5 h-5 text-slate-400" />
            },
            {
              label: "Active",
              value: stats.active,
              color: "text-emerald-600",
              icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
            },
            {
              label: "Expiring Soon",
              value: stats.expiring,
              color: "text-amber-600",
              icon: <Clock className="w-5 h-5 text-amber-500" />
            },
            {
              label: "Expired",
              value: stats.expired,
              color: "text-red-600",
              icon: <XCircle className="w-5 h-5 text-red-500" />
            }
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color} mt-0.5`}>
                  {s.value}
                </p>
              </div>
              {s.icon}
            </div>
          ))}
        </div>

        {/* ── Search + Filter Bar ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, document number…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="all">All Sectors</option>
                {uniqueSectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
              >
                <option value="all">All Types</option>
                {Object.keys(documentTypeConfig).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setSectorFilter("all");
                  }}
                  className="sm:col-span-3 text-sm text-blue-600 hover:underline font-medium text-left"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {paginatedDocs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">
                No documents found
              </h3>
              <p className="text-xs text-slate-400">
                {searchQuery || activeFilterCount > 0
                  ? "Try adjusting your search or filters"
                  : "No documents have been added yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.sortable ? "cursor-pointer select-none group hover:text-slate-700" : ""}`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.sortable && (
                            <SortIcon
                              column={col.key}
                              sortConfig={sortConfig}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDocs.map((doc) => {
                    const sCfg =
                      statusConfig[doc.status] || statusConfig.Active;
                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Document / Number */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-1 h-8 rounded-full flex-shrink-0 ${sCfg.dot}`}
                            />
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-slate-800 truncate max-w-[180px]"
                                title={doc.fullName}
                              >
                                {doc.fullName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">
                                {doc.documentNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <DocTypePill type={doc.name} />
                        </td>

                        {/* Owner */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-slate-700 font-medium truncate max-w-[140px]"
                                title={doc.user.fullName}
                              >
                                {doc.user.fullName}
                              </p>
                              {doc.user.email && (
                                <p className="text-xs text-slate-400 truncate max-w-[140px]">
                                  {doc.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="px-4 py-3">
                          {doc.user.sector ? (
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                              {doc.user.sector}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Issued */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 whitespace-nowrap">
                            {doc.issueDate}
                          </span>
                        </td>

                        {/* Expires */}
                        <td className="px-4 py-3">
                          {doc.expiryDate ? (
                            <span
                              className={`text-xs font-medium whitespace-nowrap ${
                                doc.status === "Expired"
                                  ? "text-red-600"
                                  : doc.status === "Expiring Soon"
                                    ? "text-amber-600"
                                    : "text-slate-600"
                              }`}
                            >
                              {doc.expiryDate}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">
                              No expiry
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={doc.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`${IMAGE_URL}/${doc.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </a>
                            <a
                              href={`${IMAGE_URL}${doc.fileUrl}`}
                              download
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              disabled={actionLoading === doc.id}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {actionLoading === doc.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Table Footer / Pagination ── */}
          {paginatedDocs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocs.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredDocs.length}
                </span>{" "}
                documents
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Add Document Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Document
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the details below
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFile(null);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Target type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Target *
                </label>
                <div className="flex gap-2">
                  {["user", "sector"].map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setNewDocument({ ...newDocument, targetType: t })
                      }
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold capitalize transition-all ${
                        newDocument.targetType === t
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t === "user" ? "Specific User" : "Entire Sector"}
                    </button>
                  ))}
                </div>
              </div>

              {newDocument.targetType === "user" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    User *
                  </label>
                  <select
                    value={newDocument.userId}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, userId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select a user…</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} — {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newDocument.targetType === "sector" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Sector *
                  </label>
                  <select
                    value={newDocument.sector}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, sector: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select a sector…</option>
                    {uniqueSectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Document Type *
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                >
                  {Object.keys(documentTypeConfig).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full / Business Name *
                </label>
                <input
                  type="text"
                  value={newDocument.fullName}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, fullName: e.target.value })
                  }
                  placeholder="Enter full name or business name"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Grants / Permissions *
                </label>
                <textarea
                  value={newDocument.grants}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, grants: e.target.value })
                  }
                  placeholder="What does this document grant or permit?"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Document Number *
                </label>
                <input
                  type="text"
                  value={newDocument.documentNumber}
                  onChange={(e) =>
                    setNewDocument({
                      ...newDocument,
                      documentNumber: e.target.value
                    })
                  }
                  placeholder="e.g. RC-0001234"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={newDocument.issueDate}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        issueDate: e.target.value
                      })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newDocument.expiry}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, expiry: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Upload File *
                </label>
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 transition-colors ${
                    selectedFile
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Upload
                    className={`w-8 h-8 ${selectedFile ? "text-blue-500" : "text-slate-400"}`}
                  />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-blue-700">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-blue-500 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-600">
                        Click to upload file
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PDF, DOC, DOCX, JPG, PNG — max 10 MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedFile(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDocument}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
