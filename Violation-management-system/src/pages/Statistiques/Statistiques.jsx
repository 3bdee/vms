import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, AlertTriangle, BookOpen } from "lucide-react";
import Header from "../../components/Header";

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
  "#ffecd2",
  "#fcb69f",
  "#a8edea",
  "#fed6e3",
];
const API_URL = "http://167.88.39.169:5000/api/statistics";

const token = localStorage.getItem("token");
const schoolId = localStorage.getItem("school_id");
const Statistiques = () => {
  const [stats, setStats] = useState({
    monthly: [],
    teachers: [],
    students: [],
    levels: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({});

  if (!token) {
    setLoading(true);
  }
  if (!schoolId) {
    setLoading(true);
  }

  const fetchStats = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const [resTotals, res1, res2, res3, res4] = await Promise.all([
      fetch(`${API_URL}/totals/${schoolId}`, { headers }),
      fetch(`${API_URL}/monthly/${schoolId}`, { headers }),
      fetch(`${API_URL}/top-students/${schoolId}`, { headers }),
      fetch(`${API_URL}/top-teachers/${schoolId}`, { headers }),
      fetch(`${API_URL}/level/${schoolId}`, { headers }),
    ]);
    setTotals(await resTotals.json());
    setStats({
      monthly: await res1.json(),
      teachers: await res3.json(),
      students: await res2.json(),
      levels: await res4.json(),
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="main-container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="main-container">
          <div className="alert alert-error">
            <AlertTriangle size={20} />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="main-container">
        <div className="fade-in">
          {/* Page Header */}
          <div className="mb-8">
            <h1
              className="text-center"
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              Statistiques des Violations
            </h1>
            <p
              className="text-center"
              style={{ color: "#64748b", fontSize: "1.125rem" }}
            >
              Analyse détaillée des violations scolaires
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-number" style={{ color: "#ef4444" }}>
                    {totals.total_violations}
                  </div>
                  <div className="stat-label">Total Violations</div>
                </div>
                <AlertTriangle size={32} color="#ef4444" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-number" style={{ color: "#3b82f6" }}>
                    {totals.total_students}
                  </div>
                  <div className="stat-label">Élèves Concernés</div>
                </div>
                <Users size={32} color="#3b82f6" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-number" style={{ color: "#10b981" }}>
                    {totals.total_teachers}
                  </div>
                  <div className="stat-label">Enseignants Impliqués</div>
                </div>
                <BookOpen size={32} color="#10b981" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-number" style={{ color: "#f59e0b" }}>
                    {totals.total_students > 0
                      ? (
                          totals.total_violations / totals.total_students
                        ).toFixed(1)
                      : 0}
                  </div>
                  <div className="stat-label">Moyenne par Élève</div>
                </div>
                <TrendingUp size={32} color="#f59e0b" />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Violations */}
            <div className="chart-container">
              <h3 className="chart-title">
                Évolution mensuelle des violations
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: "#667eea", strokeWidth: 2, r: 6 }}
                    name="Violations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Teachers and Students Charts */}
            <div className="grid grid-cols-2 gap-6">
              {/* Top Teachers */}
              <div className="chart-container">
                <h3 className="chart-title">
                  Top 10 Enseignants (Violations signalées)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.teachers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

                    <XAxis
                      type="category"
                      dataKey="full_name"
                      stroke="#64748b"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis type="number" stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="total_assigned" name="Violations">
                      {stats.teachers.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Students */}
              <div className="chart-container">
                <h3 className="chart-title">
                  Top 10 Élèves (Plus de violations)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.students}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="full_name"
                      stroke="#64748b"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="total_violations" name="Violations">
                      {stats.students.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Level Distribution */}
            <div className="chart-container">
              <h3 className="chart-title">
                Répartition des violations par niveau
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stats.levels}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, total_violations, percent }) =>
                      `${level}: ${total_violations} (${(percent * 100).toFixed(
                        0
                      )}%)`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="total_violations"
                  >
                    {stats.levels.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;
