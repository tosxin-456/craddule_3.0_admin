import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, IMAGE_URL } from "../../config/apiConfig";
import {
  X,
  FileText,
  User,
  Briefcase,
  Clipboard,
  Download,
  Users,
  Calendar,
  MapPin,
  CreditCard,
  BriefcaseIcon,
  Hash,
  Home,
  File,
  DollarSign,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Info,
  Image as ImageIcon,
  FileImage,
  Receipt
} from "lucide-react";

export default function AdminFirsApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [feedbackUpdate, setFeedbackUpdate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/firs-applications?page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          console.log(data);
          setApplications(data.applications);
          setPages(data.pages);
        } else {
          toast.error(data.message || "Failed to fetch FIRS applications");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching FIRS applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [page, token]);

  const downloadDocument = (docPath) => {
    if (!docPath) return toast.error("No document available");

    const url = `${API_BASE_URL}${docPath}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = docPath.split("/").pop();
    a.click();
  };

  const openImageModal = (imagePath) => {
    if (!imagePath) return toast.error("No image available");
    setSelectedImage(`${API_BASE_URL}${imagePath}`);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const openModal = (app) => {
    setSelectedApp(app);
    setStatusUpdate(app.status);
    setFeedbackUpdate(app.adminFeedback || "");
  };

  const parseArray = (value) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  };

  const closeModal = () => setSelectedApp(null);

  const updateApplication = async () => {
    setUpdating(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/firs-applications/${selectedApp.id}/update`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: statusUpdate,
            adminFeedback: feedbackUpdate
          })
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Application updated successfully");
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApp.id
              ? { ...app, status: statusUpdate, adminFeedback: feedbackUpdate }
              : app
          )
        );
        closeModal();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        dotBg: "bg-emerald-500",
        icon: CheckCircle2,
        label: "Approved",
        gradient: "from-emerald-500 to-teal-500"
      },
      pending: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        dotBg: "bg-amber-500",
        icon: Clock,
        label: "Pending",
        gradient: "from-amber-500 to-orange-500"
      },
      ongoing: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        dotBg: "bg-blue-500",
        icon: AlertCircle,
        label: "Ongoing",
        gradient: "from-blue-500 to-indigo-500"
      },
      review_failed: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        dotBg: "bg-red-500",
        icon: XCircle,
        label: "Review Failed",
        gradient: "from-red-500 to-rose-500"
      }
    };
    return configs[status] || configs.pending;
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.firstName + " " + app.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.businessName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Get stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    ongoing: applications.filter((a) => a.status === "ongoing").length,
    approved: applications.filter((a) => a.status === "approved").length,
    failed: applications.filter((a) => a.status === "review_failed").length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-slate-600 font-semibold text-lg">
            Loading applications...
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-1">
                  FIRS TIN Applications
                </h1>
                <p className="text-slate-500 text-sm lg:text-base">
                  Manage and review Tax Identification Number applications
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {stats.total} Total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            gradient="from-amber-500 to-orange-500"
            bgColor="bg-amber-50"
            textColor="text-amber-700"
          />
          <StatCard
            label="Ongoing"
            value={stats.ongoing}
            icon={AlertCircle}
            gradient="from-blue-500 to-indigo-500"
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-500"
            bgColor="bg-emerald-50"
            textColor="text-emerald-700"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            gradient="from-red-500 to-rose-500"
            bgColor="bg-red-50"
            textColor="text-red-700"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 backdrop-blur-xl bg-white/80">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by applicant name or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="relative group sm:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all appearance-none bg-slate-50 focus:bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="approved">Approved</option>
                <option value="review_failed">Review Failed</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No applications found
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : "There are no FIRS TIN applications available at the moment. New applications will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredApplications.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              const displayName =
                app.businessName ||
                `${app.firstName || ""} ${app.middleName || ""} ${
                  app.lastName || ""
                }`.trim() ||
                "Unnamed Applicant";

              return (
                <div
                  key={app.id}
                  onClick={() => openModal(app)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Card Header with Gradient */}
                  <div
                    className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`}
                  ></div>

                  <div className="p-6">
                    {/* Applicant Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors shadow-sm">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors text-lg">
                            {displayName}
                          </h3>
                        </div>
                        {app.registrationType && (
                          <p className="text-sm text-slate-500 font-medium ml-12 flex items-center gap-1">
                            <BriefcaseIcon className="w-3.5 h-3.5" />
                            {app.registrationType}
                          </p>
                        )}
                        {app.taxPayerType && (
                          <p className="text-xs text-slate-400 font-medium ml-12 mt-1">
                            {app.taxPayerType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-5">
                      <div
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} text-sm font-semibold shadow-sm`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${statusConfig.dotBg} animate-pulse`}
                        ></div>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-3 mb-5">
                      {app.businessEmail && (
                        <div className="flex items-center gap-2.5 text-sm group/item">
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover/item:bg-blue-50 transition-colors">
                            <Hash className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-blue-600 transition-colors" />
                          </div>
                          <span className="text-slate-500 font-medium min-w-[60px]">
                            Email:
                          </span>
                          <span className="text-slate-800 font-semibold truncate">
                            {app.businessEmail}
                          </span>
                        </div>
                      )}
                      {app.businessPhone && (
                        <div className="flex items-center gap-2.5 text-sm group/item">
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover/item:bg-blue-50 transition-colors">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-blue-600 transition-colors" />
                          </div>
                          <span className="text-slate-500 font-medium">
                            Phone:
                          </span>
                          <span className="text-slate-800 font-semibold">
                            {app.businessPhone}
                          </span>
                        </div>
                      )}
                      {app.residentialAddress && (
                        <div className="flex items-center gap-2.5 text-sm group/item">
                          <div className="p-1.5 bg-slate-100 rounded-lg group-hover/item:bg-blue-50 transition-colors">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover/item:text-blue-600 transition-colors" />
                          </div>
                          <span className="text-slate-500 font-medium">
                            Address:
                          </span>
                          <span className="text-slate-800 font-semibold truncate">
                            {app.residentialAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-md border border-slate-200 hover:border-blue-300">
                      <Eye className="w-4 h-4" />
                      View Full Details
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-2 font-semibold text-slate-700 shadow-sm hover:shadow"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 min-w-[100px] text-center">
              {page} / {pages}
            </div>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all flex items-center gap-2 font-semibold text-slate-700 shadow-sm hover:shadow"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start pt-8 sm:pt-12 z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl relative my-8 animate-in slide-in-from-bottom-8 duration-300">
              {/* Modal Header with Gradient */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl z-10 shadow-xl">
                <button
                  onClick={closeModal}
                  className="absolute top-6 right-6 p-2.5 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300 group"
                >
                  <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <div className="flex items-start gap-4 pr-16">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Receipt className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedApp.businessName ||
                        `${selectedApp.firstName || ""} ${
                          selectedApp.middleName || ""
                        } ${selectedApp.lastName || ""}`.trim() ||
                        "Applicant Details"}
                    </h2>
                    <div className="flex flex-wrap gap-3 items-center">
                      {selectedApp.registrationType && (
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                          {selectedApp.registrationType}
                        </span>
                      )}
                      {selectedApp.taxPayerType && (
                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {selectedApp.taxPayerType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6 max-h-[calc(90vh-240px)] overflow-y-auto">
                {/* Personal Information */}
                <Section
                  title="Personal Information"
                  icon={User}
                  gradient="from-blue-500 to-indigo-500"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem
                      icon={User}
                      label="First Name"
                      value={selectedApp.firstName}
                    />
                    <InfoItem
                      icon={User}
                      label="Middle Name"
                      value={selectedApp.middleName}
                    />
                    <InfoItem
                      icon={User}
                      label="Last Name"
                      value={selectedApp.lastName}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Date of Birth"
                      value={selectedApp.dateOfBirth}
                    />
                    <InfoItem
                      icon={User}
                      label="Gender"
                      value={selectedApp.gender}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Nationality"
                      value={selectedApp.nationality}
                    />
                    <InfoItem icon={Hash} label="NIN" value={selectedApp.nin} />
                    <InfoItem icon={Hash} label="BVN" value={selectedApp.bvn} />
                    <InfoItem
                      icon={Home}
                      label="Residential Address"
                      value={selectedApp.residentialAddress}
                      fullWidth
                    />
                  </div>
                </Section>

                {/* Business Information */}
                {(selectedApp.businessName ||
                  selectedApp.businessAddress ||
                  selectedApp.businessEmail) && (
                  <Section
                    title="Business Information"
                    icon={Building2}
                    gradient="from-purple-500 to-pink-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <InfoItem
                        icon={Briefcase}
                        label="Business Name"
                        value={selectedApp.businessName}
                      />
                      <InfoItem
                        icon={FileText}
                        label="Nature of Business"
                        value={selectedApp.natureOfBusiness}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Date of Incorporation"
                        value={selectedApp.dateOfIncorporation}
                      />
                      <InfoItem
                        icon={Hash}
                        label="RC Number"
                        value={selectedApp.rcNumber}
                      />
                      <InfoItem
                        icon={Hash}
                        label="CAC ID"
                        value={selectedApp.cacId}
                      />
                      <InfoItem
                        icon={DollarSign}
                        label="Annual Turnover"
                        value={selectedApp.annualTurnover}
                      />
                      <InfoItem
                        icon={Users}
                        label="Number of Employees"
                        value={selectedApp.numberOfEmployees}
                      />
                      <InfoItem
                        icon={FileText}
                        label="Business Email"
                        value={selectedApp.businessEmail}
                      />
                      <InfoItem
                        icon={FileText}
                        label="Business Phone"
                        value={selectedApp.businessPhone}
                      />
                      <InfoItem
                        icon={Home}
                        label="Business Address"
                        value={selectedApp.businessAddress}
                        fullWidth
                      />
                    </div>
                  </Section>
                )}

                {/* Tax Information */}
                <Section
                  title="Tax Information"
                  icon={Receipt}
                  gradient="from-teal-500 to-cyan-500"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem
                      icon={Hash}
                      label="Previous TIN"
                      value={selectedApp.previousTin}
                    />
                    <InfoItem
                      icon={Building2}
                      label="Existing Tax Office"
                      value={selectedApp.existingTaxOffice}
                    />
                    <InfoItem
                      icon={CheckCircle2}
                      label="Registered for VAT"
                      value={selectedApp.registeredForVAT ? "Yes" : "No"}
                    />
                    <InfoItem
                      icon={Hash}
                      label="VAT Number"
                      value={selectedApp.vatNumber}
                    />
                    <InfoItem
                      icon={CheckCircle2}
                      label="Registered for WHT"
                      value={selectedApp.registeredForWHT ? "Yes" : "No"}
                    />
                  </div>
                </Section>

                {/* Employment Information */}
                {(selectedApp.employerName ||
                  selectedApp.employmentStatus ||
                  selectedApp.monthlyIncome) && (
                  <Section
                    title="Employment Information"
                    icon={Briefcase}
                    gradient="from-orange-500 to-red-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <InfoItem
                        icon={Briefcase}
                        label="Employment Status"
                        value={selectedApp.employmentStatus}
                      />
                      <InfoItem
                        icon={Building2}
                        label="Employer Name"
                        value={selectedApp.employerName}
                      />
                      <InfoItem
                        icon={DollarSign}
                        label="Monthly Income"
                        value={selectedApp.monthlyIncome}
                      />
                      <InfoItem
                        icon={Home}
                        label="Employer Address"
                        value={selectedApp.employerAddress}
                        fullWidth
                      />
                    </div>
                  </Section>
                )}

                {/* Contact Person Information */}
                {(selectedApp.contactPersonName ||
                  selectedApp.contactPersonEmail ||
                  selectedApp.contactPersonPhone) && (
                  <Section
                    title="Contact Person"
                    icon={User}
                    gradient="from-pink-500 to-rose-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <InfoItem
                        icon={User}
                        label="Name"
                        value={selectedApp.contactPersonName}
                      />
                      <InfoItem
                        icon={Briefcase}
                        label="Designation"
                        value={selectedApp.contactPersonDesignation}
                      />
                      <InfoItem
                        icon={FileText}
                        label="Email"
                        value={selectedApp.contactPersonEmail}
                      />
                      <InfoItem
                        icon={FileText}
                        label="Phone"
                        value={selectedApp.contactPersonPhone}
                      />
                    </div>
                  </Section>
                )}

                {/* Banking Information */}
                {(selectedApp.bankName ||
                  selectedApp.accountNumber ||
                  selectedApp.accountName) && (
                  <Section
                    title="Banking Information"
                    icon={CreditCard}
                    gradient="from-indigo-500 to-blue-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <InfoItem
                        icon={Building2}
                        label="Bank Name"
                        value={selectedApp.bankName}
                      />
                      <InfoItem
                        icon={Hash}
                        label="Account Number"
                        value={selectedApp.accountNumber}
                      />
                      <InfoItem
                        icon={User}
                        label="Account Name"
                        value={selectedApp.accountName}
                      />
                    </div>
                  </Section>
                )}

                {/* People Information */}
                {(parseArray(selectedApp.directors) ||
                  parseArray(selectedApp.partners)) && (
                  <Section
                    title="Company Officials"
                    icon={Users}
                    gradient="from-violet-500 to-purple-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ArrayInfoItem
                        label="Directors"
                        value={parseArray(selectedApp.directors)}
                      />
                      <ArrayInfoItem
                        label="Partners"
                        value={parseArray(selectedApp.partners)}
                      />
                    </div>
                  </Section>
                )}

                {/* Documents with Image Preview */}
                <Section
                  title="Uploaded Documents"
                  icon={File}
                  gradient="from-amber-500 to-yellow-500"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedApp.validID && (
                      <ImageDocumentCard
                        label="Valid ID"
                        imagePath={selectedApp.validID}
                        onView={() => openImageModal(selectedApp.validID)}
                        onDownload={() => downloadDocument(selectedApp.validID)}
                      />
                    )}
                    {selectedApp.utilityBill && (
                      <ImageDocumentCard
                        label="Utility Bill"
                        imagePath={selectedApp.utilityBill}
                        onView={() => openImageModal(selectedApp.utilityBill)}
                        onDownload={() =>
                          downloadDocument(selectedApp.utilityBill)
                        }
                      />
                    )}
                    {selectedApp.passportPhoto && (
                      <ImageDocumentCard
                        label="Passport Photo"
                        imagePath={selectedApp.passportPhoto}
                        onView={() => openImageModal(selectedApp.passportPhoto)}
                        onDownload={() =>
                          downloadDocument(selectedApp.passportPhoto)
                        }
                      />
                    )}
                    {selectedApp.cacCertificate && (
                      <ImageDocumentCard
                        label="CAC Certificate"
                        imagePath={selectedApp.cacCertificate}
                        onView={() =>
                          openImageModal(selectedApp.cacCertificate)
                        }
                        onDownload={() =>
                          downloadDocument(selectedApp.cacCertificate)
                        }
                      />
                    )}
                    {selectedApp.businessPermit && (
                      <ImageDocumentCard
                        label="Business Permit"
                        imagePath={selectedApp.businessPermit}
                        onView={() =>
                          openImageModal(selectedApp.businessPermit)
                        }
                        onDownload={() =>
                          downloadDocument(selectedApp.businessPermit)
                        }
                      />
                    )}
                    {selectedApp.bankStatement && (
                      <ImageDocumentCard
                        label="Bank Statement"
                        imagePath={selectedApp.bankStatement}
                        onView={() => openImageModal(selectedApp.bankStatement)}
                        onDownload={() =>
                          downloadDocument(selectedApp.bankStatement)
                        }
                      />
                    )}
                    {!selectedApp.validID &&
                      !selectedApp.utilityBill &&
                      !selectedApp.passportPhoto &&
                      !selectedApp.cacCertificate &&
                      !selectedApp.businessPermit &&
                      !selectedApp.bankStatement && (
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 col-span-full">
                          <Info className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            No documents uploaded
                          </span>
                        </div>
                      )}
                  </div>
                </Section>

                {/* Admin Actions */}
                <Section
                  title="Review & Update Application"
                  icon={Clipboard}
                  gradient="from-indigo-500 to-purple-500"
                  elevated
                >
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Application Status
                      </label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all bg-white font-medium text-slate-700 cursor-pointer hover:border-slate-300"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="ongoing">🔄 Ongoing</option>
                        <option value="approved">✅ Approved</option>
                        <option value="review_failed">❌ Review Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Admin Remarks / Feedback
                      </label>
                      <textarea
                        value={feedbackUpdate}
                        onChange={(e) => setFeedbackUpdate(e.target.value)}
                        rows={5}
                        placeholder="Enter your review comments, feedback, or additional notes here..."
                        className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-400"
                      />
                    </div>

                    <button
                      onClick={updateApplication}
                      disabled={updating}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all flex items-center justify-center gap-2.5 text-lg disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating Application...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Update Application
                        </>
                      )}
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {imageModalOpen && selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
            onClick={closeImageModal}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group z-10"
            >
              <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div
              className="max-w-5xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Document preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon: Icon, gradient, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg shadow-${gradient.split("-")[1]}-500/20 group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
      <div className="text-sm font-semibold text-slate-500">{label}</div>
    </div>
  );
}

function Section({ title, icon: Icon, gradient, children, elevated = false }) {
  return (
    <section
      className={`rounded-2xl p-6 border transition-all ${
        elevated
          ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-md"
          : "bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200"
      }`}
    >
      <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
        <div
          className={`p-2.5 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoItem({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "md:col-span-2 lg:col-span-3" : ""}>
      <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all group shadow-sm hover:shadow">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 group-hover:bg-blue-50 rounded-lg transition-colors">
            <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              {label}
            </p>
            <p className="text-sm text-slate-800 font-semibold break-words leading-relaxed">
              {value || (
                <span className="text-slate-400 italic font-normal">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrayInfoItem({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            {label}
          </p>
          {value ? (
            <div className="flex flex-wrap gap-2">
              {value.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">Not provided</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageDocumentCard({ label, imagePath, onView, onDownload }) {
  const imageUrl = `${IMAGE_URL}${imagePath}`;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all group">
      <div
        className="relative h-48 bg-slate-100 cursor-pointer overflow-hidden"
        onClick={onView}
      >
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f1f5f9' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-3 bg-white/90 hover:bg-white rounded-xl transition-all group/btn"
            >
              <Eye className="w-5 h-5 text-slate-700 group-hover/btn:text-blue-600 transition-colors" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="p-3 bg-white/90 hover:bg-white rounded-xl transition-all group/btn"
            >
              <Download className="w-5 h-5 text-slate-700 group-hover/btn:text-blue-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileImage className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-blue-200"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={onDownload}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
