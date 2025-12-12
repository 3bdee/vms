import { Link } from "react-router-dom";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow p-5 space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <nav className="flex flex-col space-y-2">
          <Link className="text-blue-600" to="/">
            Today's Absences
          </Link>
          <Link className="text-blue-600" to="/add">
            Add Absence
          </Link>
          <Link className="text-blue-600" to="/stats">
            Statistics
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

export default DashboardLayout;
