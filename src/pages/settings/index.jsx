export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span>User Registration</span>
          <input type="checkbox" />
        </div>

        <div className="flex justify-between items-center">
          <span>Maintenance Mode</span>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}
