import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  FileText,
  MessageSquare,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  Award,
  Building2,
  Clock
} from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";
import toast from "react-hot-toast";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(8px)",
    animation: "fadeIn 0.2s ease-out"
  },
  modal: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "900px",
    borderRadius: "24px",
    maxHeight: "92vh",
    overflowY: "auto",
    position: "relative",
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    animation: "slideUp 0.3s ease-out"
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "32px 40px",
    borderRadius: "24px 24px 0 0",
    color: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
  },
  content: {
    padding: "32px 40px 40px",
    backgroundColor: "#f9fafb"
  },
  closeBtn: {
    position: "absolute",
    top: 24,
    right: 32,
    background: "rgba(255,255,255,0.25)",
    border: "none",
    cursor: "pointer",
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    color: "#fff",
    backdropFilter: "blur(10px)"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBottom: 12,
    borderBottom: "2px solid #e5e7eb"
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 28,
    borderRadius: 16,
    marginBottom: 24,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
    transition: "all 0.2s"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontWeight: 600,
    color: "#6b7280",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  value: {
    color: "#111827",
    fontSize: 15,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 14px",
    borderRadius: 24,
    fontSize: 13,
    fontWeight: 600,
    gap: 6,
    whiteSpace: "nowrap"
  },
  reviewCard: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    border: "1px solid #e5e7eb",
    transition: "all 0.2s"
  },
  docItem: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1px solid #e5e7eb",
    transition: "all 0.2s",
    cursor: "pointer"
  },
  downloadBtn: {
    backgroundColor: "#667eea",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s"
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    padding: 16,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#fff"
  }
};

export default function UserDetailsModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError("");
    setData(null);

    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/admin/user/details/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        console.log(result);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (!userId) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Not Started": { bg: "#fee2e2", color: "#991b1b", icon: Clock },
      "In Progress": { bg: "#fef3c7", color: "#92400e", icon: Clock },
      Completed: { bg: "#d1fae5", color: "#065f46", icon: CheckCircle },
      approved: { bg: "#d1fae5", color: "#065f46", icon: CheckCircle },
      Active: { bg: "#dbeafe", color: "#1e40af", icon: CheckCircle }
    };
    const style = statusColors[status] || {
      bg: "#f3f4f6",
      color: "#374151",
      icon: Clock
    };
    const Icon = style.icon;

    return (
      <span
        style={{
          ...styles.badge,
          backgroundColor: style.bg,
          color: style.color
        }}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const handleDownloadDocument = async (docId, docName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/documents/${docId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docName || `document_${docId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to download document: " + err.message);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.35)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.25)";
              e.target.style.transform = "scale(1)";
            }}
          >
            <X size={22} />
          </button>

          {data && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    margin: 0,
                    marginBottom: 8,
                    letterSpacing: "-0.5px"
                  }}
                >
                  {data.user.fullName}
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.95,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <Mail size={16} /> {data.user.email}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16
                }}
              >
                <div style={styles.statCard}>
                  <FileText size={24} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {data.documents.length}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Documents</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <Star size={24} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {data.reviews.length}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Reviews</div>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <MessageSquare size={24} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {data.tickets.length}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>Tickets</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={styles.content}>
          {loading && (
            <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>
                Loading user details…
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                color: "#dc2626",
                backgroundColor: "#fee2e2",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {data && (
            <>
              {/* USER INFORMATION */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <User size={20} style={{ color: "#667eea" }} />
                  Personal & Business Information
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <Mail size={14} /> Email
                    </div>
                    <div style={styles.value}>{data.user.email}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <Globe size={14} /> Country
                    </div>
                    <div style={styles.value}>{data.user.country}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <Briefcase size={14} /> Startup
                    </div>
                    <div style={styles.value}>{data.user.startupName}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <TrendingUp size={14} /> Stage
                    </div>
                    <div style={styles.value}>{data.user.stage}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <Building2 size={14} /> Sector
                    </div>
                    <div style={styles.value}>{data.user.sector}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Industry</div>
                    <div style={styles.value}>{data.user.industry}</div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Verification</div>
                    <div style={styles.value}>
                      {data.user.isVerified ? (
                        <span
                          style={{
                            color: "#059669",
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <CheckCircle size={18} /> Verified
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#dc2626",
                            display: "flex",
                            alignItems: "center",
                            gap: 6
                          }}
                        >
                          <XCircle size={18} /> Not Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Onboarding</div>
                    <div style={styles.value}>
                      {getStatusBadge(data.user.onboardingStatus)}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>
                      <Calendar size={14} /> Joined
                    </div>
                    <div style={styles.value}>
                      {formatDate(data.user.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPLIANCE */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <ShieldCheck size={20} style={{ color: "#10b981" }} />
                  Compliance Details
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.label}>Title</div>
                    <div style={styles.value}>
                      {data.compliance?.title ||
                        data.compliance?.fullName ||
                        "—"}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Status</div>
                    <div style={styles.value}>
                      {getStatusBadge(data.compliance?.complianceStatus || "—")}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Document Status</div>
                    <div style={styles.value}>
                      {getStatusBadge(data.compliance?.documentStatus || "—")}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Sector</div>
                    <div style={styles.value}>
                      {data.compliance?.sector || "—"}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Cost</div>
                    <div
                      style={{
                        ...styles.value,
                        fontWeight: 600,
                        color: "#059669",
                        fontSize: 16
                      }}
                    >
                      ₦{data.compliance?.cost?.toLocaleString() || "0"}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Authorized</div>
                    <div style={styles.value}>
                      {data.compliance?.authorized ? (
                        <span style={{ color: "#059669" }}>
                          Yes • {formatDate(data.compliance?.authorizedAt)}
                        </span>
                      ) : (
                        <span style={{ color: "#dc2626" }}>Not Authorized</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Issue Date</div>
                    <div style={styles.value}>
                      {formatDate(data.compliance?.issueDate)}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Expiry Date</div>
                    <div style={styles.value}>
                      {formatDate(data.compliance?.expiryDate)}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Completed Date</div>
                    <div style={styles.value}>
                      {formatDate(data.compliance?.completedDate)}
                    </div>
                  </div>

                  <div style={styles.infoItem}>
                    <div style={styles.label}>Source</div>
                    <div style={styles.value}>
                      {data.compliance?.source || "—"}
                    </div>
                  </div>
                </div>

                {data.compliance?.description && (
                  <div
                    style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid #e5e7eb"
                    }}
                  >
                    <div style={styles.label}>Description</div>
                    <div
                      style={{ ...styles.value, marginTop: 8, lineHeight: 1.6 }}
                    >
                      {data.compliance.description}
                    </div>
                  </div>
                )}
              </div>

              {/* DOCUMENTS */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <FileText size={20} style={{ color: "#3b82f6" }} />
                  Documents ({data.documents.length})
                </div>

                {data.documents.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#9ca3af"
                    }}
                  >
                    <FileText
                      size={48}
                      style={{ margin: "0 auto 12px", opacity: 0.3 }}
                    />
                    <p style={{ margin: 0 }}>No documents uploaded</p>
                  </div>
                ) : (
                  data.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={styles.docItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#dbeafe",
                          borderRadius: 10,
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <FileText size={22} color="#3b82f6" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            marginBottom: 4,
                            color: "#111827"
                          }}
                        >
                          {doc.fullName}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          {doc.name} • ID: {doc.id}
                        </div>
                      </div>
                      <button
                        style={styles.downloadBtn}
                        onClick={() =>
                          handleDownloadDocument(doc.id, doc.fullName)
                        }
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#5568d3";
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#667eea";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* REVIEWS */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <Star size={20} style={{ color: "#f59e0b" }} />
                  Reviews ({data.reviews.length})
                </div>

                {data.reviews.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#9ca3af"
                    }}
                  >
                    <Star
                      size={48}
                      style={{ margin: "0 auto 12px", opacity: 0.3 }}
                    />
                    <p style={{ margin: 0 }}>No reviews yet</p>
                  </div>
                ) : (
                  data.reviews.map((review) => (
                    <div
                      key={review.id}
                      style={styles.reviewCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#fef3c7",
                              borderRadius: 10,
                              width: 48,
                              height: 48,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Star size={24} fill="#f59e0b" color="#f59e0b" />
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 28,
                              color: "#111827"
                            }}
                          >
                            {review.score}%
                          </span>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                      <p
                        style={{
                          fontSize: 15,
                          color: "#4b5563",
                          margin: 0,
                          lineHeight: 1.7,
                          fontStyle: review.feedback ? "normal" : "italic"
                        }}
                      >
                        {review.feedback || "No feedback provided"}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* TICKETS */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <MessageSquare size={20} style={{ color: "#8b5cf6" }} />
                  Support Tickets ({data.tickets.length})
                </div>

                {data.tickets.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "#9ca3af"
                    }}
                  >
                    <MessageSquare
                      size={48}
                      style={{ margin: "0 auto 12px", opacity: 0.3 }}
                    />
                    <p style={{ margin: 0 }}>No support tickets</p>
                  </div>
                ) : (
                  data.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      style={styles.docItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#ede9fe",
                          borderRadius: 10,
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <MessageSquare size={22} color="#8b5cf6" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 15,
                            marginBottom: 4,
                            color: "#111827"
                          }}
                        >
                          {ticket.subject}
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          Status: {ticket.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
