import { useState } from "react";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config/apiConfig";

export default function CompliancePaymentButton({ compliance }) {
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const isPaid = compliance.Payments?.some((p) => p.status === "Paid");

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
        <CheckCircle className="w-4 h-4" />
        Paid
      </span>
    );
  }

  if (compliance.complianceStatus !== "Completed") {
    return null;
  }

  async function handlePay() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/payments/compliance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userComplianceId: compliance.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Payment successful 🎉");

      // Ideally refetch compliance list here
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-700 text-white font-semibold hover:from-red-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      Pay ₦{compliance.ComplianceItem?.price?.toLocaleString()}
    </button>
  );
}
