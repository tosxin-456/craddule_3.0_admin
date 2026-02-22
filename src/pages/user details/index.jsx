import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, IMAGE_URL } from "../../config/apiConfig";
import toast from "react-hot-toast";

export default function AdminUserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/admin/user/details/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        console.log(data);
        setUser(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, token]);


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading user details...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        No user found
      </div>
    );

  const tabs = [
    { id: "overview", label: "Overview", icon: "👤" },
    { id: "cac", label: "CAC Applications", icon: "🏢" },
    { id: "firs", label: "TIN Applications", icon: "💰" },
    { id: "scuml", label: "SCUML Applications", icon: "📋" },
    { id: "compliance", label: "Compliance", icon: "✅" },
    { id: "documents", label: "Documents", icon: "📁" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.user.fullName}
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "overview" && <OverviewTab user={user.user} />}
          {activeTab === "cac" && (
            <CACTab applications={user.cacApplications} token={token} />
          )}
          {activeTab === "firs" && (
            <FIRSTab applications={user.firsApplications} token={token} />
          )}
          {activeTab === "scuml" && (
            <SCUMLTab applications={user.scumlApplications} token={token} />
          )}
          {activeTab === "compliance" && (
            <ComplianceTab compliance={user.compliance} token={token} />
          )}
          {activeTab === "documents" && (
            <DocumentsTab documents={user.documents} token={token} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">👤</span>
        <h2 className="text-2xl font-bold text-gray-900">User Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard icon="📧" label="Email" value={user.email} />
        <InfoCard icon="🌍" label="Country" value={user.country} />
        <InfoCard icon="🎯" label="Sector" value={user.sector} />
      </div>
    </div>
  );
}

// CAC Applications Tab
function CACTab({ applications, token }) {
  if (!applications || applications.length === 0) {
    return <EmptyState message="No CAC applications found" icon="🏢" />;
  }

  return (
    <div className="space-y-6">
      {applications.map((app, index) => (
        <CACApplicationForm
          key={app.id}
          application={app}
          index={index}
          token={token}
        />
      ))}
    </div>
  );
}

// CAC Application Form Component
// Only status, adminFeedback, and price are editable
function CACApplicationForm({ application, index, token }) {
  const [editableData, setEditableData] = useState({
    status: application.status,
    adminFeedback: application.adminFeedback,
    price: application.price
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE_URL}/admin/cac-applications/${application.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editableData)
        }
      );
      if (!res.ok) throw new Error("Failed to update CAC application");
      toast.success("CAC application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const directors =
    typeof application.directors === "string"
      ? JSON.parse(application.directors)
      : application.directors;
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏢</span>
          <h3 className="text-xl font-semibold">
            CAC Application #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={editableData.status} />
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>✏️</span> Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <span>💾</span> {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Read-only sections */}
      <FormSection title="Company Information" icon="🏢">
        <ReadOnlyField
          icon="🏷️"
          label="Company Name"
          value={application.companyName}
        />
        <ReadOnlyField
          icon="📑"
          label="Company Type"
          value={application.companyType}
        />
        <ReadOnlyField
          icon="📧"
          label="Email Address"
          value={application.emailAddress}
        />
        <ReadOnlyField
          icon="📍"
          label="Registered Office Address"
          value={application.registeredOfficeAddress}
        />
        <ReadOnlyField
          icon="🏢"
          label="Head Office Address"
          value={application.headOfficeAddress}
        />
      </FormSection>

      <FormSection title="Share Capital Information" icon="💰">
        <ReadOnlyField
          icon="📊"
          label="Number of Shares"
          value={application.numberOfShares}
        />
        <ReadOnlyField
          icon="💵"
          label="Price per Share (₦)"
          value={application.pricePerShare}
        />
        <ReadOnlyField
          icon="💰"
          label="Total Share Capital (₦)"
          value={application.totalShareCapital}
        />
        <ReadOnlyField
          icon="📝"
          label="Share Capital in Words"
          value={application.shareCapitalInWords}
        />
      </FormSection>

      <FormSection title="Director Information" icon="👔">
        <ReadOnlyField
          icon="👤"
          label="Director Name & Tel"
          value={application.directorNameAndTel}
        />
        <ImageField
          icon="✍️"
          label="Director Signature"
          path={application.directorSignature}
        />
      </FormSection>

      {/* <FormSection> */}
      {/* Directors Details */}
      {application.directors && directors && directors.length > 0 && (
        <FormSection title="Directors Details" icon="🧑‍💼">
          <div className="md:col-span-2 flex flex-wrap gap-6">
            {" "}
            {/* ← add md:col-span-2 */}
            {directors.map((director, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[300px] border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col gap-3"
              >
                <h4 className="font-semibold text-lg mb-2">
                  Director {idx + 1}
                </h4>

                <ReadOnlyField
                  icon="👤"
                  label="Full Name"
                  value={director.fullName}
                />
                <ReadOnlyField icon="📧" label="Email" value={director.email} />
                <ReadOnlyField
                  icon="📱"
                  label="Phone"
                  value={director.phoneNo}
                />
                <ReadOnlyField
                  icon="🏠"
                  label="Residential Address"
                  value={director.residentialAddress}
                />
                <ReadOnlyField icon="🌆" label="City" value={director.city} />
                <ReadOnlyField icon="🏙️" label="State" value={director.state} />
                <ReadOnlyField
                  icon="🌍"
                  label="Country"
                  value={director.country}
                />
                <ReadOnlyField
                  icon="🆔"
                  label="ID Type"
                  value={director.idType}
                />
                <ReadOnlyField
                  icon="🆔"
                  label="ID Number"
                  value={director.idNo}
                />
                <ReadOnlyField
                  icon="🎂"
                  label="Date of Birth"
                  value={director.dateOfBirth}
                />
                <ReadOnlyField
                  icon="⚥"
                  label="Gender"
                  value={director.gender}
                />
                <ReadOnlyField
                  icon="📅"
                  label="Consent Date"
                  value={director.consentDate}
                />

                {/* Uploaded Documents */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {director.signatureUrl && (
                    <ImageField
                      icon="✍️"
                      label="Signature"
                      path={director.signatureUrl}
                    />
                  )}
                  {director.proofOfIdentityUrl && (
                    <ImageField
                      icon="🪪"
                      label="Proof of Identity"
                      path={director.proofOfIdentityUrl}
                    />
                  )}
                  {director.utilityBillUrl && (
                    <ImageField
                      icon="🧾"
                      label="Utility Bill / Proof of Address"
                      path={director.utilityBillUrl}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}
      {/* </FormSection> */}

      <FormSection title="Secretary Information" icon="📋">
        <ReadOnlyField
          icon="🏷️"
          label="Secretary Type"
          value={application.secretaryType}
        />
        <ReadOnlyField
          icon="👤"
          label="Secretary Name"
          value={application.secretaryName}
        />
        <ReadOnlyField
          icon="📧"
          label="Secretary Email"
          value={application.secretaryEmail}
        />
        <ReadOnlyField
          icon="📱"
          label="Secretary Phone"
          value={application.secretaryPhone}
        />
        <ReadOnlyField
          icon="📍"
          label="Secretary Address"
          value={application.secretaryAddress}
        />
        <ReadOnlyField
          icon="🆔"
          label="Secretary ID Type"
          value={application.secretaryIdType}
        />
        <ImageField
          icon="✍️"
          label="Secretary Signature"
          path={application.secretarySignature}
        />
      </FormSection>

      <FormSection title="Payment Information" icon="💳">
        <ReadOnlyField
          icon="✅"
          label="Is Paid"
          value={application.isPaid ? "Yes" : "No"}
        />
        <ReadOnlyField
          icon="📊"
          label="Payment Status"
          value={application.paymentStatus}
        />
      </FormSection>

      {/* Editable section */}
      <FormSection title="Admin Controls" icon="🛠️">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={editableData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={editableData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <div className="md:col-span-2">
          <FormField
            icon="💬"
            label="Admin Feedback"
            type="textarea"
            value={editableData.adminFeedback}
            onChange={(v) => handleChange("adminFeedback", v)}
            disabled={!isEditing}
          />
        </div>
      </FormSection>
    </div>
  );
}

// FIRS Applications Tab
function FIRSTab({ applications, token }) {
  if (!applications || applications.length === 0) {
    return <EmptyState message="No TIN applications found" icon="💰" />;
  }

  return (
    <div className="space-y-6">
      {applications.map((app, index) => (
        <FIRSApplicationForm
          key={app.id}
          application={app}
          index={index}
          token={token}
        />
      ))}
    </div>
  );
}

// Only status, adminFeedback, and price are editable
function FIRSApplicationForm({ application, index, token }) {
  const [editableData, setEditableData] = useState({
    status: application.status,
    adminFeedback: application.adminFeedback,
    price: application.price
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE_URL}/admin/firs-applications/${application.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editableData)
        }
      );
      if (!res.ok) throw new Error("Failed to update FIRS application");
      toast.success("FIRS application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <h3 className="text-xl font-semibold">
            TIN Application #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={editableData.status} />
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>✏️</span> Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <span>💾</span> {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Read-only sections */}
      <FormSection title="Taxpayer Information" icon="👤">
        <ReadOnlyField
          icon="🏷️"
          label="Taxpayer Name"
          value={application.taxpayerName}
        />
        <ReadOnlyField
          icon="🔢"
          label="RC Number"
          value={application.rcNumber}
        />
        <ReadOnlyField
          icon="🆔"
          label="Previous TIN"
          value={application.previousTin}
        />
        <ReadOnlyField
          icon="🏢"
          label="Tax Office"
          value={application.taxOffice}
        />
      </FormSection>

      <FormSection title="Business Information" icon="🏭">
        <ReadOnlyField
          icon="📝"
          label="Nature of Business"
          value={application.natureOfBusiness}
        />
        <ReadOnlyField
          icon="💼"
          label="Source of Income"
          value={application.sourceOfIncome}
        />
        <ReadOnlyField
          icon="📊"
          label="VAT Liability"
          value={application.vatLiability}
        />
        <ReadOnlyField
          icon="📍"
          label="Registered Office Address"
          value={application.registeredOfficeAddress}
        />
        <ReadOnlyField icon="🏦" label="Bankers" value={application.bankers} />
      </FormSection>

      <FormSection title="Important Dates" icon="📅">
        <ReadOnlyField
          icon="📅"
          label="Date of Incorporation"
          value={application.dateOfIncorporation?.split("T")[0]}
        />
        <ReadOnlyField
          icon="📅"
          label="Commencement Date"
          value={application.commencementDate?.split("T")[0]}
        />
        <ReadOnlyField
          icon="📅"
          label="Accounting Year End"
          value={application.accountingYearEnd?.split("T")[0]}
        />
      </FormSection>

      <FormSection title="Documents" icon="📄">
        <ImageField
          icon="📄"
          label="Application Letter"
          path={application.applicationLetter}
        />
      </FormSection>

      <FormSection title="Payment Information" icon="💳">
        <ReadOnlyField
          icon="✅"
          label="Is Paid"
          value={application.isPaid ? "Yes" : "No"}
        />
      </FormSection>

      {/* Editable section */}
      <FormSection title="Admin Controls" icon="🛠️">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={editableData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={editableData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <div className="md:col-span-2">
          <FormField
            icon="💬"
            label="Admin Feedback"
            type="textarea"
            value={editableData.adminFeedback}
            onChange={(v) => handleChange("adminFeedback", v)}
            disabled={!isEditing}
          />
        </div>
      </FormSection>
    </div>
  );
}

// SCUML Applications Tab
function SCUMLTab({ applications, token }) {
  if (!applications || applications.length === 0) {
    return <EmptyState message="No SCUML applications found" icon="📋" />;
  }

  return (
    <div className="space-y-6">
      {applications.map((app, index) => (
        <SCUMLApplicationForm
          key={app.id}
          application={app}
          index={index}
          token={token}
        />
      ))}
    </div>
  );
}

// Only status, adminFeedback, and price are editable
function SCUMLApplicationForm({ application, index, token }) {
  const [editableData, setEditableData] = useState({
    status: application.status,
    adminFeedback: application.adminFeedback,
    price: application.price
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `${API_BASE_URL}/admin/scuml-applications/${application.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editableData)
        }
      );
      if (!res.ok) throw new Error("Failed to update SCUML application");
      toast.success("SCUML application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📋</span>
          <h3 className="text-xl font-semibold">
            SCUML Application #{index + 1}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={editableData.status} />
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>✏️</span> Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <span>💾</span> {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Read-only sections */}
      <FormSection title="Business Information" icon="🏢">
        <ReadOnlyField
          icon="🏷️"
          label="Business Name"
          value={application.businessName}
        />
        <ReadOnlyField
          icon="📑"
          label="Business Category"
          value={application.businessCategory}
        />
        <ReadOnlyField
          icon="🔢"
          label="RC Number"
          value={application.rcNumber}
        />
        <ReadOnlyField icon="🆔" label="TIN" value={application.tin} />
        <ReadOnlyField icon="📧" label="Email" value={application.email} />
      </FormSection>

      <FormSection title="Addresses" icon="📍">
        <ReadOnlyField
          icon="🏢"
          label="Registered Office Address"
          value={application.registeredOfficeAddress}
        />
        <ReadOnlyField icon="🏦" label="Bankers" value={application.bankers} />
      </FormSection>

      <FormSection title="Compliance Officer" icon="👔">
        <ReadOnlyField
          icon="👤"
          label="Name"
          value={application.complianceOfficerName}
        />
        <ReadOnlyField
          icon="💼"
          label="Designation"
          value={application.complianceOfficerDesignation}
        />
        <ReadOnlyField
          icon="📧"
          label="Email"
          value={application.complianceOfficerEmail}
        />
        <ReadOnlyField
          icon="📱"
          label="Phone"
          value={application.complianceOfficerPhone}
        />
      </FormSection>

      <FormSection title="Payment Information" icon="💳">
        <ReadOnlyField
          icon="✅"
          label="Is Paid"
          value={application.isPaid ? "Yes" : "No"}
        />
      </FormSection>

      {/* Editable section */}
      <FormSection title="Admin Controls" icon="🛠️">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={editableData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={editableData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <div className="md:col-span-2">
          <FormField
            icon="💬"
            label="Admin Feedback"
            type="textarea"
            value={editableData.adminFeedback}
            onChange={(v) => handleChange("adminFeedback", v)}
            disabled={!isEditing}
          />
        </div>
      </FormSection>
    </div>
  );
}

// ─── COMPLIANCE TAB — READ ONLY ────────────────────────────────────────────────
function ComplianceTab({ compliance, token }) {
  if (!compliance) {
    return <EmptyState message="No compliance information found" icon="✅" />;
  }

  // Parse formData grants JSON for display
  let parsedGrants = {};
  try {
    parsedGrants = JSON.parse(compliance.formData || "{}");
  } catch {}

  const fileUrl = compliance.fileUrl
    ? compliance.fileUrl.startsWith("http")
      ? compliance.fileUrl
      : `${IMAGE_URL}${compliance.fileUrl}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">✅</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Compliance Information
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{compliance.title}</p>
          </div>
        </div>
        <StatusBadge status={compliance.documentStatus} />
      </div>

      <div className="border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon="📋" label="Title" value={compliance.title} />
          <InfoCard icon="👤" label="Full Name" value={compliance.fullName} />
          <InfoCard icon="🏭" label="Sector" value={compliance.sector} />
          <InfoCard
            icon="💰"
            label="Price"
            value={compliance.price === 0 ? "Free" : `₦${compliance.price}`}
          />
          <InfoCard icon="🤖" label="Source" value={compliance.source} />
          <InfoCard
            icon="✅"
            label="Authorized"
            value={compliance.authorized ? "Yes" : "No"}
          />
          <InfoCard icon="📅" label="Issue Date" value={compliance.issueDate} />
          <InfoCard
            icon="📅"
            label="Expiry Date"
            value={compliance.expiryDate || "N/A"}
          />
          <InfoCard
            icon="📅"
            label="Authorized At"
            value={
              compliance.authorizedAt
                ? new Date(compliance.authorizedAt).toLocaleDateString()
                : "N/A"
            }
          />
          <InfoCard
            icon="🎯"
            label="Compliance Status"
            value={compliance.complianceStatus}
          />
          <InfoCard
            icon="📄"
            label="Document Status"
            value={compliance.documentStatus}
          />
          <InfoCard
            icon="🔢"
            label="Document Number"
            value={compliance.documentNumber}
          />
          <InfoCard
            icon="📅"
            label="Completed Date"
            value={
              compliance.completedDate
                ? compliance.completedDate.split("T")[0]
                : "N/A"
            }
          />
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 border-b pb-2">
            <span>📝</span> Description
          </h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {compliance.description}
          </p>
        </div>

        {/* Submitted Form Data (grants) */}
        {Object.keys(parsedGrants).length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
              <span>📋</span> Submitted Form Data
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedGrants).map(([key, val]) => {
                if (key === "file" || (typeof val === "object" && val !== null))
                  return null;
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase());
                return (
                  <InfoCard
                    key={key}
                    icon="📝"
                    label={label}
                    value={String(val)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded File */}
        {fileUrl && (
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
              <span>📁</span> Uploaded Document
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <img
                src={fileUrl}
                alt="Compliance document"
                className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                style={{ maxHeight: "400px" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <span>🔗</span> View / Download Document
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DOCUMENTS TAB — READ ONLY ─────────────────────────────────────────────────
function DocumentsTab({ documents, token }) {
  if (!documents || documents.length === 0) {
    return <EmptyState message="No documents found" icon="📁" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📁</span>
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <span className="ml-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          {documents.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documents.map((doc, index) => (
          <DocumentCard key={doc.id} doc={doc} index={index} />
        ))}
      </div>
    </div>
  );
}

// Read-only document card
function DocumentCard({ doc, index }) {
  const [expanded, setExpanded] = useState(false);

  // Parse grants JSON
  let parsedGrants = {};
  try {
    parsedGrants = JSON.parse(doc.grants || "{}");
  } catch {}

  const fileUrl = doc.fileUrl
    ? doc.fileUrl.startsWith("http")
      ? doc.fileUrl
      : `${IMAGE_URL}${doc.fileUrl}`
    : null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">📄</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
            <p className="text-xs text-gray-500 truncate">{doc.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <StatusBadge status={doc.status} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Quick Info (always visible) */}
      <div className="px-5 py-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Issue Date:</span>{" "}
          <span className="font-medium">{doc.issueDate || "N/A"}</span>
        </div>
        <div>
          <span className="text-gray-500">Expiry:</span>{" "}
          <span className="font-medium">{doc.expiryDate || "N/A"}</span>
        </div>
        <div>
          <span className="text-gray-500">Doc Number:</span>{" "}
          <span className="font-medium">{doc.documentNumber || "N/A"}</span>
        </div>
        {fileUrl && (
          <div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>🔗</span> View File
            </a>
          </div>
        )}
      </div>

      {/* Expanded Content — read only */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Status & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon="🎯" label="Status" value={doc.status} />
            <InfoCard
              icon="🔢"
              label="Document Number"
              value={doc.documentNumber}
            />
            <InfoCard
              icon="📅"
              label="Issue Date"
              value={doc.issueDate?.split("T")[0]}
            />
            <InfoCard
              icon="📅"
              label="Expiry Date"
              value={doc.expiryDate?.split("T")[0]}
            />
          </div>

          {/* Submitted Grant Data */}
          {Object.keys(parsedGrants).length > 0 && (
            <div>
              <h5 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <span>📋</span> Submitted Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(parsedGrants).map(([key, val]) => {
                  if (
                    key === "file" ||
                    (typeof val === "object" && val !== null)
                  )
                    return null;
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase());
                  return (
                    <InfoCard
                      key={key}
                      icon="📝"
                      label={label}
                      value={String(val)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* File Preview */}
          {fileUrl && (
            <div>
              <h5 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                <span>🖼️</span> Uploaded File
              </h5>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                <img
                  src={fileUrl}
                  alt={doc.name}
                  className="max-w-full h-auto rounded border border-gray-300 shadow-sm"
                  style={{ maxHeight: "250px" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <span>🔗</span> View Full File
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────────

function FormSection({ title, icon, children }) {
  return (
    <div className="mt-6">
      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// Read-only display field (styled like FormField but never editable)
function ReadOnlyField({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </label>
      <p className="w-full px-3 py-2 text-gray-800 text-sm">{value || "N/A"}</p>
    </div>
  );
}

function FormField({
  icon,
  label,
  value,
  onChange,
  disabled,
  type = "text",
  options = []
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
        />
      ) : type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
        />
      )}
    </div>
  );
}

function ImageField({ icon, label, path }) {
  if (!path || path === "null") {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </label>
        <p className="text-gray-500 text-sm">No image uploaded</p>
      </div>
    );
  }

  const imageUrl = path.startsWith("http") ? path : `${IMAGE_URL}${path}`;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </label>
      <div className="mt-2">
        <img
          src={imageUrl}
          alt={label}
          className="max-w-full h-auto rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
          style={{ maxHeight: "300px" }}
        />
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <span>🔗</span> View Full Image
        </a>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-base font-medium text-gray-900">{value || "N/A"}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    approved: "bg-green-100 text-green-800",
    Active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    Pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    Revoked: "bg-red-100 text-red-800",
    Expired: "bg-red-100 text-red-800",
    needs_fine_tuning: "bg-orange-100 text-orange-800",
    Inactive: "bg-gray-100 text-gray-800",
    "Not Started": "bg-gray-100 text-gray-800"
  };

  const statusIcons = {
    approved: "✅",
    Active: "✅",
    pending: "⏳",
    Pending: "⏳",
    rejected: "❌",
    Revoked: "🚫",
    Expired: "⌛",
    needs_fine_tuning: "⚠️",
    Inactive: "⭕",
    "Not Started": "⭕"
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
    >
      <span>{statusIcons[status] || "📋"}</span>
      {status}
    </span>
  );
}

function EmptyState({ message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <span className="text-6xl mb-4">{icon}</span>
      <p className="text-lg">{message}</p>
    </div>
  );
}
