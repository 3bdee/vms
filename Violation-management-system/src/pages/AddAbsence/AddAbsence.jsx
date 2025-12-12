import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function AddAbsence() {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const school_id = localStorage.getItem("school_id");
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/students/school`, {
        headers: {
          Authorization: `Bearer ${token}`, // if your authenticate middleware uses JWT
        },
      });

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/levels/school`, {
        headers: {
          Authorization: `Bearer ${token}`, // if your authenticate middleware uses JWT
        },
      });

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();

      setLevels(data);
      console.log(levels);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels().then(setLevels);
    fetchStudents();
  }, []);

  const loadStudents = async (level) => {
    setSelectedLevel(level);
    const list = await fetchStudentsByLevel(level);
    setStudents(list);
    setSelectedStudents([]);
  };
  const toggleStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((x) => x !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const submit = async () => {
    await submitAbsences(selectedLevel, selectedStudents);
    alert("Absences added!");
  };

  if (loading) {
    return (
      <div>
        <div className="main-container">
          <div className="loading">
            <div className="spinner">Loading......</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <h2 className="text-xl font-bold mb-4">Add Absence</h2>

      {/* Level Selector */}
      <select
        className="border p-2 rounded mb-4"
        onChange={(e) => loadStudents(e.target.value)}
      >
        <option>Select level</option>
        {levels.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      {/* Students Table */}
      {students.length > 0 && (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Student</th>
              <th className="p-2">Assign</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.firstName + " " + s.lastName}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleStudent(s.id)}
                    className={`px-3 py-1 rounded text-white ${
                      selectedStudents.includes(s.id)
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {selectedStudents.includes(s.id) ? "Remove" : "Add"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {students.length > 0 && (
        <button
          onClick={submit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Absences
        </button>
      )}
    </DashboardLayout>
  );
}
