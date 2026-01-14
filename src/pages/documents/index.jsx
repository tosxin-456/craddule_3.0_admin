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
  Calendar,
  Info,
  Building2,
  Shield,
  Receipt,
  Search,
  Filter,
  Download,
  Clock,
  AlertCircle,
  Folder,
  FolderOpen,
  File,
  Upload,
  Users
} from "lucide-react";
import { API_BASE_URL, IMAGE_URL } from "../../config/apiConfig";
import toast from "react-hot-toast";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFolder, setOpenFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
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

  const documentTypeConfig = {
    "CAC Certificate": {
      icon: <Building2 className="w-5 h-5" />,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    "Industry License": {
      icon: <Shield className="w-5 h-5" />,
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    "Tax Identification Number": {
      icon: <Receipt className="w-5 h-5" />,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200"
    },
    "Tax Clearance Certificate": {
      icon: <FileText className="w-5 h-5" />,
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-200"
    },
    Other: {
      icon: <FileText className="w-5 h-5" />,
      color: "gray",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-200"
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

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

  function openAddModalForUser(user) {
    setSelectedUserForModal(user);
    setNewDocument({
      ...newDocument,
      userId: user.id.toString(),
      targetType: "user"
    });
    setShowAddModal(true);
  }

  async function handleAddDocumentForUser() {
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
      setSelectedUserForModal(null);
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
      setDocuments(documents.filter((d) => d.id !== docId));
      toast.success("Document deleted successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-3.5 h-3.5" />
      },
      "Expiring Soon": {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <Clock className="w-3.5 h-3.5" />
      },
      Expired: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />
      }
    };
    const config = statusConfig[status] || statusConfig.Active;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  const documentsByUser = documents.reduce((acc, doc) => {
    const userId = doc.userId;
    if (!acc[userId]) {
      const user = users.find((u) => u.id === userId);
      acc[userId] = {
        user: user || { id: userId, fullName: "Unknown User", email: "" },
        documents: []
      };
    }
    acc[userId].documents.push(doc);
    return acc;
  }, {});

  const filteredFolders = Object.values(documentsByUser).filter((folder) => {
    const user = folder.user;
    const userLabel = `${user.fullName} ${user.email}`.toLowerCase();
    const matchesSearch = userLabel.includes(searchQuery.toLowerCase());

    const matchesSector =
      sectorFilter === "all" || user.sector === sectorFilter;

    const hasMatchingDocs = folder.documents.some((doc) => {
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      const matchesType = typeFilter === "all" || doc.name === typeFilter;
      return matchesStatus && matchesType;
    });

    return matchesSearch && matchesSector && hasMatchingDocs;
  });

  const getFilteredDocs = (docs) => {
    return docs.filter((doc) => {
      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;
      const matchesType = typeFilter === "all" || doc.name === typeFilter;
      return matchesStatus && matchesType;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSectorFilter("all");
  };

  const getTotalStats = () => {
    return {
      total: documents.length,
      active: documents.filter((d) => d.status === "Active").length,
      expiring: documents.filter((d) => d.status === "Expiring Soon").length,
      expired: documents.filter((d) => d.status === "Expired").length,
      users: Object.keys(documentsByUser).length
    };
  };

  const getUniqueSectors = () => {
    const sectors = users.map((u) => u.sector).filter(Boolean);
    return [...new Set(sectors)].sort();
  };

  const stats = getTotalStats();
  const uniqueSectors = getUniqueSectors();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500 font-medium">
          Loading documents...
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
              Error Loading Documents
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Document Folders
                </h1>
                <p className="text-blue-100">
                  Browse user folders and manage documents by user or sector
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUserForModal(null);
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
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Document
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 p-6 bg-gray-50">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Folders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.users}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Files
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.active}
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
                    Expiring
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.expiring}
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
                    Expired
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.expired}
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Filter Folders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Active">✓ Active</option>
              <option value="Expiring Soon">⏰ Expiring Soon</option>
              <option value="Expired">✗ Expired</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              {Object.keys(documentTypeConfig).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery ||
            statusFilter !== "all" ||
            typeFilter !== "all" ||
            sectorFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                Active filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  <Search className="w-3 h-3" />
                  {searchQuery}
                </span>
              )}
              {sectorFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                  Sector: {sectorFilter}
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                  Status: {statusFilter}
                </span>
              )}
              {typeFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                  Type: {typeFilter}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Folders Grid */}
        {filteredFolders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Folders Found
            </h3>
            <p className="text-gray-500">
              {searchQuery ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              sectorFilter !== "all"
                ? "Try adjusting your filters"
                : "No user folders available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFolders.map((folder) => {
              const user = folder.user;
              const filteredDocs = getFilteredDocs(folder.documents);
              const isOpen = openFolder === user.id;
              const activeCount = filteredDocs.filter(
                (d) => d.status === "Active"
              ).length;
              const expiredCount = filteredDocs.filter(
                (d) => d.status === "Expired"
              ).length;

              return (
                <div key={user.id}>
                  {/* Folder Card */}
                  <div
                    onClick={() => setOpenFolder(isOpen ? null : user.id)}
                    className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {isOpen ? (
                            <FolderOpen className="w-8 h-8 text-white" />
                          ) : (
                            <Folder className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddModalForUser(user);
                          }}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1 truncate">
                        {user.email}
                      </p>
                      {user.sector && (
                        <p className="text-xs text-blue-600 font-medium mb-3">
                          {user.sector}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm">
                          <File className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {filteredDocs.length}
                          </span>
                          <span className="text-gray-500">files</span>
                        </div>
                        <div className="flex gap-1">
                          {activeCount > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                              {activeCount}
                            </span>
                          )}
                          {expiredCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
                              {expiredCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Folder Contents */}
                  {isOpen && (
                    <div className="mt-4 space-y-3 ml-4 border-l-2 border-blue-200 pl-4">
                      {filteredDocs.map((doc) => {
                        const config =
                          documentTypeConfig[doc.name] ||
                          documentTypeConfig.Other;
                        return (
                          <div
                            key={doc.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`rounded-lg p-2 ${config.bgColor}`}
                              >
                                <div className={config.textColor}>
                                  {config.icon}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm mb-0.5">
                                      {doc.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate">
                                      {doc.fullName}
                                    </p>
                                  </div>
                                  {getStatusBadge(doc.status)}
                                </div>

                                <div className="space-y-1 mb-3">
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Doc #:</span>{" "}
                                    {doc.documentNumber}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Issued:</span>{" "}
                                    {doc.issueDate}
                                  </p>
                                  {doc.expiryDate && (
                                    <p className="text-xs text-gray-500">
                                      <span className="font-medium">
                                        Expires:
                                      </span>{" "}
                                      {doc.expiryDate}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href={`${IMAGE_URL}${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                  </a>

                                  <a
                                    href={`${IMAGE_URL}${doc.fileUrl}`}
                                    download
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                  </a>

                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    disabled={actionLoading === doc.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
                                  >
                                    {actionLoading === doc.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {selectedUserForModal
                  ? `Add Document for ${selectedUserForModal.fullName}`
                  : "Add New Document"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFile(null);
                  setSelectedUserForModal(null);
                }}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!selectedUserForModal && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Type
                  </label>
                  <select
                    value={newDocument.targetType}
                    onChange={(e) =>
                      setNewDocument({
                        ...newDocument,
                        targetType: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Specific User</option>
                    <option value="sector">Entire Sector</option>
                  </select>
                </div>
              )}

              {!selectedUserForModal && newDocument.targetType === "user" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select User *
                  </label>
                  <select
                    value={newDocument.userId}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, userId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedUserForModal && newDocument.targetType === "sector" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Sector *
                  </label>
                  <select
                    value={newDocument.sector}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, sector: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a sector...</option>
                    {uniqueSectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(documentTypeConfig).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name / Business Name *
                </label>
                <input
                  type="text"
                  value={newDocument.fullName}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name or business name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grants / Permissions *
                </label>
                <textarea
                  value={newDocument.grants}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, grants: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter what this document grants or permits"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newDocument.expiry}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, expiry: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : "Click to upload"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedFile(null);
                    setSelectedUserForModal(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDocumentForUser}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
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