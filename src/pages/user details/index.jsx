import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, IMAGE_URL } from "../../config/apiConfig";

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
    // { id: "compliance", label: "Compliance", icon: "✅" },
    // { id: "onboarding", label: "Onboarding", icon: "🚀" }
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
            <ComplianceTab compliance={user.compliance} />
          )}
          {activeTab === "onboarding" && (
            <OnboardingTab onboarding={user.onboarding} />
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
        {/* <InfoCard icon="📱" label="Phone Number" value={user.phoneNumber} /> */}
        <InfoCard icon="🌍" label="Country" value={user.country} />
        {/* <InfoCard icon="🚀" label="Startup Name" value={user.startupName} /> */}
        {/* <InfoCard icon="📊" label="Stage" value={user.stage} /> */}
        {/* <InfoCard icon="🏭" label="Industry" value={user.industry} /> */}
        <InfoCard icon="🎯" label="Sector" value={user.sector} />
        {/* <InfoCard
          icon="✅"
          label="Verified"
          value={user.isVerified ? "Yes" : "No"}
        /> */}
        {/* <InfoCard
          icon="📝"
          label="Onboarding Status"
          value={user.onboardingStatus}
        /> */}
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
function CACApplicationForm({ application, index, token }) {
  const [formData, setFormData] = useState(application);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          body: JSON.stringify(formData)
        }
      );
      if (!res.ok) throw new Error("Failed to update CAC application");
      alert("CAC application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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
          <StatusBadge status={formData.status} />
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

      {/* Company Information */}
      <FormSection title="Company Information" icon="🏢">
        <FormField
          icon="🏷️"
          label="Company Name"
          value={formData.companyName}
          onChange={(v) => handleChange("companyName", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📑"
          label="Company Type"
          value={formData.companyType}
          onChange={(v) => handleChange("companyType", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📧"
          label="Email Address"
          value={formData.emailAddress}
          onChange={(v) => handleChange("emailAddress", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📍"
          label="Registered Office Address"
          value={formData.registeredOfficeAddress}
          onChange={(v) => handleChange("registeredOfficeAddress", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🏢"
          label="Head Office Address"
          value={formData.headOfficeAddress}
          onChange={(v) => handleChange("headOfficeAddress", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Share Capital Information */}
      <FormSection title="Share Capital Information" icon="💰">
        <FormField
          icon="📊"
          label="Number of Shares"
          type="number"
          value={formData.numberOfShares}
          onChange={(v) => handleChange("numberOfShares", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="💵"
          label="Price per Share (₦)"
          value={formData.pricePerShare}
          onChange={(v) => handleChange("pricePerShare", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="💰"
          label="Total Share Capital (₦)"
          value={formData.totalShareCapital}
          onChange={(v) => handleChange("totalShareCapital", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📝"
          label="Share Capital in Words"
          value={formData.shareCapitalInWords}
          onChange={(v) => handleChange("shareCapitalInWords", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Director Information */}
      <FormSection title="Director Information" icon="👔">
        <FormField
          icon="👤"
          label="Director Name & Tel"
          value={formData.directorNameAndTel}
          onChange={(v) => handleChange("directorNameAndTel", v)}
          disabled={!isEditing}
        />
        <ImageField
          icon="✍️"
          label="Director Signature"
          path={formData.directorSignature}
        />
      </FormSection>

      {/* Secretary Information */}
      <FormSection title="Secretary Information" icon="📋">
        <FormField
          icon="🏷️"
          label="Secretary Type"
          value={formData.secretaryType}
          onChange={(v) => handleChange("secretaryType", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="👤"
          label="Secretary Name"
          value={formData.secretaryName}
          onChange={(v) => handleChange("secretaryName", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📧"
          label="Secretary Email"
          value={formData.secretaryEmail}
          onChange={(v) => handleChange("secretaryEmail", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📱"
          label="Secretary Phone"
          value={formData.secretaryPhone}
          onChange={(v) => handleChange("secretaryPhone", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📍"
          label="Secretary Address"
          value={formData.secretaryAddress}
          onChange={(v) => handleChange("secretaryAddress", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🆔"
          label="Secretary ID Type"
          value={formData.secretaryIdType}
          onChange={(v) => handleChange("secretaryIdType", v)}
          disabled={!isEditing}
        />
        <ImageField
          icon="✍️"
          label="Secretary Signature"
          path={formData.secretarySignature}
        />
      </FormSection>

      {/* Payment Information */}
      <FormSection title="Payment Information" icon="💳">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={formData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="✅"
          label="Is Paid"
          type="select"
          value={formData.isPaid}
          onChange={(v) => handleChange("isPaid", v === "true")}
          disabled={!isEditing}
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" }
          ]}
        />
        <FormField
          icon="📊"
          label="Payment Status"
          type="select"
          value={formData.paymentStatus}
          onChange={(v) => handleChange("paymentStatus", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "failed", label: "Failed" }
          ]}
        />
      </FormSection>

      {/* Application Status */}
      <FormSection title="Application Status" icon="📊">
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={formData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <FormField
          icon="💬"
          label="Admin Feedback"
          type="textarea"
          value={formData.adminFeedback}
          onChange={(v) => handleChange("adminFeedback", v)}
          disabled={!isEditing}
        />
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

// FIRS Application Form Component
function FIRSApplicationForm({ application, index, token }) {
  const [formData, setFormData] = useState(application);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          body: JSON.stringify(formData)
        }
      );
      if (!res.ok) throw new Error("Failed to update FIRS application");
      alert("FIRS application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert("Error: " + err.message);
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
          <StatusBadge status={formData.status} />
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

      {/* Taxpayer Information */}
      <FormSection title="Taxpayer Information" icon="👤">
        <FormField
          icon="🏷️"
          label="Taxpayer Name"
          value={formData.taxpayerName}
          onChange={(v) => handleChange("taxpayerName", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🔢"
          label="RC Number"
          value={formData.rcNumber}
          onChange={(v) => handleChange("rcNumber", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🆔"
          label="Previous TIN"
          value={formData.previousTin}
          onChange={(v) => handleChange("previousTin", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🏢"
          label="Tax Office"
          value={formData.taxOffice}
          onChange={(v) => handleChange("taxOffice", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Business Information */}
      <FormSection title="Business Information" icon="🏭">
        <FormField
          icon="📝"
          label="Nature of Business"
          value={formData.natureOfBusiness}
          onChange={(v) => handleChange("natureOfBusiness", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="💼"
          label="Source of Income"
          value={formData.sourceOfIncome}
          onChange={(v) => handleChange("sourceOfIncome", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📊"
          label="VAT Liability"
          type="select"
          value={formData.vatLiability}
          onChange={(v) => handleChange("vatLiability", v)}
          disabled={!isEditing}
          options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" }
          ]}
        />
        <FormField
          icon="📍"
          label="Registered Office Address"
          value={formData.registeredOfficeAddress}
          onChange={(v) => handleChange("registeredOfficeAddress", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🏦"
          label="Bankers"
          value={formData.bankers}
          onChange={(v) => handleChange("bankers", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Important Dates */}
      <FormSection title="Important Dates" icon="📅">
        <FormField
          icon="📅"
          label="Date of Incorporation"
          type="date"
          value={formData.dateOfIncorporation?.split("T")[0]}
          onChange={(v) => handleChange("dateOfIncorporation", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📅"
          label="Commencement Date"
          type="date"
          value={formData.commencementDate?.split("T")[0]}
          onChange={(v) => handleChange("commencementDate", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📅"
          label="Accounting Year End"
          type="date"
          value={formData.accountingYearEnd?.split("T")[0]}
          onChange={(v) => handleChange("accountingYearEnd", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Documents */}
      <FormSection title="Documents" icon="📄">
        <ImageField
          icon="📄"
          label="Application Letter"
          path={formData.applicationLetter}
        />
      </FormSection>

      {/* Payment Information */}
      <FormSection title="Payment Information" icon="💳">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={formData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="✅"
          label="Is Paid"
          type="select"
          value={formData.isPaid}
          onChange={(v) => handleChange("isPaid", v === "true")}
          disabled={!isEditing}
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" }
          ]}
        />
      </FormSection>

      {/* Application Status */}
      <FormSection title="Application Status" icon="📊">
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={formData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <FormField
          icon="💬"
          label="Admin Feedback"
          type="textarea"
          value={formData.adminFeedback}
          onChange={(v) => handleChange("adminFeedback", v)}
          disabled={!isEditing}
        />
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

// SCUML Application Form Component
function SCUMLApplicationForm({ application, index, token }) {
  const [formData, setFormData] = useState(application);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          body: JSON.stringify(formData)
        }
      );
      if (!res.ok) throw new Error("Failed to update SCUML application");
      alert("SCUML application updated successfully!");
      setIsEditing(false);
    } catch (err) {
      alert("Error: " + err.message);
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
          <StatusBadge status={formData.status} />
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

      {/* Business Information */}
      <FormSection title="Business Information" icon="🏢">
        <FormField
          icon="🏷️"
          label="Business Name"
          value={formData.businessName}
          onChange={(v) => handleChange("businessName", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📑"
          label="Business Category"
          value={formData.businessCategory}
          onChange={(v) => handleChange("businessCategory", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🔢"
          label="RC Number"
          value={formData.rcNumber}
          onChange={(v) => handleChange("rcNumber", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🆔"
          label="TIN"
          value={formData.tin}
          onChange={(v) => handleChange("tin", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📧"
          label="Email"
          value={formData.email}
          onChange={(v) => handleChange("email", v)}
          disabled={!isEditing}
        />
        {/* <FormField
          icon="📱"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={(v) => handleChange("phoneNumber", v)}
          disabled={!isEditing}
        /> */}
      </FormSection>

      {/* Addresses */}
      <FormSection title="Addresses" icon="📍">
        <FormField
          icon="🏢"
          label="Registered Office Address"
          value={formData.registeredOfficeAddress}
          onChange={(v) => handleChange("registeredOfficeAddress", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="🏦"
          label="Bankers"
          value={formData.bankers}
          onChange={(v) => handleChange("bankers", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Compliance Officer */}
      <FormSection title="Compliance Officer" icon="👔">
        <FormField
          icon="👤"
          label="Name"
          value={formData.complianceOfficerName}
          onChange={(v) => handleChange("complianceOfficerName", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="💼"
          label="Designation"
          value={formData.complianceOfficerDesignation}
          onChange={(v) => handleChange("complianceOfficerDesignation", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📧"
          label="Email"
          value={formData.complianceOfficerEmail}
          onChange={(v) => handleChange("complianceOfficerEmail", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="📱"
          label="Phone"
          value={formData.complianceOfficerPhone}
          onChange={(v) => handleChange("complianceOfficerPhone", v)}
          disabled={!isEditing}
        />
      </FormSection>

      {/* Payment Information */}
      <FormSection title="Payment Information" icon="💳">
        <FormField
          icon="💰"
          label="Price (₦)"
          value={formData.price}
          onChange={(v) => handleChange("price", v)}
          disabled={!isEditing}
        />
        <FormField
          icon="✅"
          label="Is Paid"
          type="select"
          value={formData.isPaid}
          onChange={(v) => handleChange("isPaid", v === "true")}
          disabled={!isEditing}
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" }
          ]}
        />
      </FormSection>

      {/* Application Status */}
      <FormSection title="Application Status" icon="📊">
        <FormField
          icon="🎯"
          label="Status"
          type="select"
          value={formData.status}
          onChange={(v) => handleChange("status", v)}
          disabled={!isEditing}
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" }
          ]}
        />
        <FormField
          icon="💬"
          label="Admin Feedback"
          type="textarea"
          value={formData.adminFeedback}
          onChange={(v) => handleChange("adminFeedback", v)}
          disabled={!isEditing}
        />
      </FormSection>
    </div>
  );
}

// Compliance Tab
function ComplianceTab({ compliance }) {
  if (!compliance) {
    return <EmptyState message="No compliance information found" icon="✅" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">✅</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Compliance Information
        </h2>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon="📋" label="Title" value={compliance.title} />
          <InfoCard icon="👤" label="Full Name" value={compliance.fullName} />
          <InfoCard icon="🏭" label="Sector" value={compliance.sector} />
          <InfoCard
            icon="📊"
            label="Compliance Status"
            value={compliance.complianceStatus}
          />
          <InfoCard icon="💰" label="Cost" value={compliance.cost} />
          <InfoCard
            icon="✅"
            label="Authorized"
            value={compliance.authorized ? "Yes" : "No"}
          />
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>📝</span> Description
          </h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {compliance.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Onboarding Tab
function OnboardingTab({ onboarding }) {
  if (!onboarding) {
    return <EmptyState message="No onboarding information found" icon="🚀" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🚀</span>
        <h2 className="text-2xl font-bold text-gray-900">
          Onboarding Information
        </h2>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InfoCard icon="📊" label="Step" value={onboarding.step} />
          <InfoCard
            icon="🆔"
            label="Review ID"
            value={onboarding.reviewId || "N/A"}
          />
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>❓</span> Question
          </h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mb-4">
            {onboarding.question}
          </p>

          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>💬</span> Answer
          </h4>
          <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
            {onboarding.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
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
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    needs_fine_tuning: "bg-orange-100 text-orange-800",
    "Not Started": "bg-gray-100 text-gray-800"
  };

  const statusIcons = {
    approved: "✅",
    pending: "⏳",
    rejected: "❌",
    needs_fine_tuning: "⚠️",
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
