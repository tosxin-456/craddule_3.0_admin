import { Activity, AlertTriangle, UserCheck } from "lucide-react";

export default function AdminActivity() {
  const logs = [
    {
      id: 1,
      action: "Admin login",
      detail: "New IP address detected",
      time: "2 minutes ago"
    },
    {
      id: 2,
      action: "User approved",
      detail: "User: user23@mail.com",
      time: "1 hour ago"
    },
    {
      id: 3,
      action: "Document flagged",
      detail: "Pitch Deck – Compliance issue",
      time: "3 hours ago"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Activity</h1>

      <div className="bg-white border rounded-xl divide-y">
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <Activity className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-gray-900">{log.action}</p>
              <p className="text-sm text-gray-500">{log.detail}</p>
            </div>

            <span className="text-xs text-gray-400">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
