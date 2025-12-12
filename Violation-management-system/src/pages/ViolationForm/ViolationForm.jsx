import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Search,
  Filter,
  AlertTriangle,
  User,
  Calendar,
  CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import Header from "../../components/Header";
import ViolationAlert from "../../components/ViolationAlert";
import { generateViolationPDF } from "../../components/PDFGenerator";

const EXCLUDED_FIELDS = [
  "id",
  "student_id",
  "teacher_id",
  "violation_id",
  "punishment_id",
  "school_id",
  "created_at",
];

const ViolationForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    level: "",
    violationId: "",
    teacherId: "",
    punishmentId: "",
    violationTime: new Date().toISOString().slice(0, 16), // Initialize with current date/time
  });

  const [violations, setViolations] = useState([]);
  const [punishments, setPunishments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [violationRecords, setViolationRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [level, setLevels] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [violationAlert, setViolationAlert] = useState({
    show: false,
    student: null,
    count: 0,
  });

  const [modals, setModals] = useState({
    addViolation: false,
    addPunishment: false,
    addViolationRecord: false,
  });

  const cleanForExport = (records) => {
    return records.map((r) => {
      const copy = { ...r };
      EXCLUDED_FIELDS.forEach((field) => delete copy[field]);
      return copy;
    });
  };

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const school_id = localStorage.getItem("school_id");
  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/violations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch violations");

      const data = await res.json();
      setViolations(data);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des violations", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPunishments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/punishments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch punishments");

      const data = await res.json();
      setPunishments(data);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des punishments", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/teachers/school`, {
        headers: {
          Authorization: `Bearer ${token}`, // if your authenticate middleware uses JWT
        },
      });

      if (!res.ok) throw new Error("Failed to fetch teachers");

      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchViolationRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/violation-records/school`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // if your authenticate middleware uses JWT
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch records");

      const data = await res.json();

      setViolationRecords(data);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des records", "error");
    } finally {
      setLoading(false);
    }
  };

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
      showAlert("Erreur lors du chargement des students", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolName = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/schools/school`, {
        headers: {
          Authorization: `Bearer ${token}`, // if your authenticate middleware uses JWT
        },
      });

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();
      setSchoolName(data[0].school_name);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des school name", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/levels/school`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch levels");

      const data = await res.json();
      setLevels(data);
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors du chargement des levels", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    fetchTeachers();
    fetchViolationRecords();
    fetchStudents();
    fetchLevels();
    fetchPunishments();
    fetchSchoolName();
  }, []);

  useEffect(() => {
    if (loading) return;

    let filtered = violationRecords || [];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();

      filtered = filtered.filter((record) => {
        const studentName = `${record?.first_name ?? ""} ${
          record?.last_name ?? ""
        }`.toLowerCase();
        const violationName = record?.violation_name?.toLowerCase() ?? "";
        const teacherName = record?.teacher_name?.toLowerCase() ?? "";

        return (
          studentName.includes(lowerSearch) ||
          violationName.includes(lowerSearch) ||
          teacherName.includes(lowerSearch)
        );
      });
    }

    // 🎓 Level filter
    if (filterLevel) {
      filtered = filtered.filter((record) => record?.level === filterLevel);
    }
    if (startDate || endDate) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.violation_time).setHours(0, 0, 0, 0);

        const start = startDate
          ? new Date(startDate).setHours(0, 0, 0, 0)
          : null;

        const end = endDate
          ? new Date(endDate).setHours(23, 59, 59, 999)
          : null;

        if (start && recordDate < start) return false;
        if (end && recordDate > end) return false;

        return true;
      });
    }
    setFilteredRecords(filtered);
  }, [searchTerm, filterLevel, startDate, endDate, violationRecords]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterLevel("");
    setStartDate("");
    setEndDate("");
  };

  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "info" }),
      5000
    );
  };

  const openModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-complete when first name is selected
    if (field === "firstName" && value) {
      const matchingStudent = students.find(
        (student) => student.first_name.toLowerCase() === value.toLowerCase()
      );

      if (matchingStudent) {
        setFormData((prev) => ({
          ...prev,
          firstName: matchingStudent.first_name,
          lastName: matchingStudent.last_name,
          level: matchingStudent.level,
        }));
      }
    }
  };

  const exportExcel = (data) => {
    const exportData = cleanForExport(filteredRecords);

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Violations");

    XLSX.writeFile(workbook, "violations_export.xlsx");
  };

  const exportPDF = () => {
    const exportData = cleanForExport(filteredRecords);
    const doc = new jsPDF();

    // extract columns
    const columns = Object.keys(exportData[0] || {});

    const rows = exportData.map((item) => Object.values(item));

    doc.text("Violation Records", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [columns],
      body: rows,
    });

    doc.save("violation_records.pdf");
  };

  const handleSubmitViolation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/violation-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          level: formData.level,
          violation_id: formData.violationId,
          punishment_id: formData.punishmentId,
          violation_time: formData.violationTime,
          teacher_id: formData.teacherId,
          school_id: school_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      const newViolationCount = data.newViolationCount;

      if (newViolationCount % 3 === 0) {
        setViolationAlert({
          show: true,
          student: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            level: formData.level,
          },
          count: newViolationCount,
        });
      } else {
        setViolationAlert({ show: false, student: null, count: 0 });
      }

      showAlert("Violation ajoutée avec succès !", "success");
      fetchViolationRecords();
      fetchStudents();
      closeModal("addViolationRecord");
      setFormData({
        firstName: "",
        lastName: "",
        level: "",
        violationId: "",
        punishmentId: "",
        violationTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors de l'ajout de la violation", "error");
    }
  };
  const handlePrintPDF = (record) => {
    if (!record) return;
    const pdfData = {
      firstName: record.first_name,
      lastName: record.last_name,
      level: record.level,
      violationName: record.violation_name,
      punishmentName: record.punishment_name,
      teacherName: record.teacher_name,
      violationTime: record.violation_time,
    };

    generateViolationPDF(pdfData);
  };

  const [newViolation, setNewViolation] = useState("");
  const [newPunishment, setNewPunishment] = useState("");

  const handleAddPunishment = async (e) => {
    e.preventDefault();

    if (!newPunishment.trim()) {
      alert("Le nom de la punition est requis !");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/punishments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ punishment_name: newPunishment }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'ajout de la punition");
      }

      const data = await res.json();

      showAlert("Sanction ajoutée avec succès", "success");
      fetchPunishments();
      setNewPunishment("");
      closeModal("addPunishment");
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors de l'ajout de la sanction", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddViolation = async (e) => {
    e.preventDefault();

    if (!newViolation.trim()) {
      alert("Le nom de la violation est requis !");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/violations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ violation_name: newViolation }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'ajout de la violation");
      }

      const data = await res.json();

      showAlert("Violation ajoutée avec succès", "success");
      fetchViolations();
      setNewViolation("");
      closeModal("addViolation");
    } catch (error) {
      console.error(error);
      showAlert("Erreur lors de l'ajout de la violation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteViolation = async (violationId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette infraction ?")
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/violation-records/${violationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      showAlert("Violation supprimée avec succès !", "success");
      fetchViolationRecords();
    } catch (error) {
      console.error(error);
      showAlert("Échec de la suppression de l'infraction", "error");
    }
  };

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

  return (
    <div>
      <Header />
      <div className="main-container">
        {/* Alert */}
        {alert.show && (
          <div className={`alert alert-${alert.type} fade-in`}>
            <AlertTriangle size={20} />
            {alert.message}
          </div>
        )}

        {/* Violation Alert Modal */}
        {violationAlert.show && (
          <ViolationAlert
            student={violationAlert.student}
            violationCount={violationAlert.count}
            onClose={() =>
              setViolationAlert({ show: false, student: null, count: 0 })
            }
          />
        )}

        {/* Main Card */}
        <div className="card fade-in">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="card-title">{schoolName}</h2>
                <p className="card-subtitle">
                  Enregistrer et gérer les violations des élèves
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => openModal("addViolation")}
                >
                  <Plus size={16} />
                  Ajouter Violation
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => openModal("addPunishment")}
                >
                  <Plus size={16} />
                  Ajouter Sanction
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openModal("addViolationRecord")}
                >
                  <Plus size={16} />
                  Nouvelle Violation
                </button>
              </div>
            </div>
          </div>

          <div className="card-content">
            {/* Search and Filter */}
            <div className="grid grid-cols-2 mb-6">
              <div className="form-group">
                <label className="form-label">
                  <Search size={16} />
                  Rechercher
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nom d'élève, violation, enseignant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Filter size={16} />
                  Filtrer par niveau
                </label>
                <select
                  className="form-select"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="">Tous les niveaux</option>
                  {level.map((teacher) => (
                    <option key={teacher.level_name} value={teacher.level_name}>
                      {teacher.level_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Start Date */}
              <div className="flex items-center gap-4">
                <label className="form-label">
                  <CalendarDays size={16} />
                  Start
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Filter by End Date */}
              <div className="flex items-center gap-4">
                <label className="form-label">
                  <CalendarDays size={16} />
                  End{" "}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear Filters
              </button>
              <button
                onClick={() => exportExcel(filteredRecords)}
                className="btn btn-secondary"
              >
                Export Excel
              </button>
              <button onClick={exportPDF} className="btn btn-secondary">
                Export PDF
              </button>
            </div>

            {/* Records Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Niveau</th>
                    <th>Violation</th>
                    <th>Enseignant</th>
                    <th>Sanction</th>
                    <th>Date/Heure</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <User size={16} color="#6b7280" />
                          {record.first_name} {record.last_name}
                        </div>
                      </td>
                      <td>{record.level}</td>
                      <td>{record.violation_name}</td>
                      <td>{record.teacher_name}</td>
                      <td>{record.punishment_name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} color="#6b7280" />
                          {new Date(record.violation_time).toLocaleString(
                            "fr-FR"
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-secondary"
                            onClick={() => handlePrintPDF(record)}
                            title="Télécharger PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteViolation(record.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="text-center" style={{ padding: "2rem" }}>
                  <p style={{ color: "#6b7280" }}>Aucune violation trouvée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Violation Record Modal */}
        {modals.addViolationRecord && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">
                  Enregistrer une nouvelle violation
                </h3>
                <button
                  className="modal-close"
                  onClick={() => closeModal("addViolationRecord")}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <form onSubmit={handleSubmitViolation}>
                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        list="students-firstname-list"
                        placeholder="Tapez le prénom de l'élève..."
                        required
                      />
                      <datalist id="students-firstname-list">
                        {students.map((student) => (
                          <option key={student.id} value={student.first_name}>
                            {student.first_name} {student.last_name} (
                            {student.level})
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Nom de famille"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Niveau</label>
                      <select
                        className="form-select"
                        value={formData.level}
                        onChange={(e) =>
                          handleInputChange("level", e.target.value)
                        }
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {level.map((teacher) => (
                          <option
                            key={teacher.level_name}
                            value={teacher.level_name}
                          >
                            {teacher.level_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Enseignant</label>
                      <select
                        className="form-select"
                        value={formData.teacherId}
                        onChange={(e) =>
                          handleInputChange("teacherId", e.target.value)
                        }
                        required
                      >
                        <option value="">Sélectionner un enseignant</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Date et heure de la violation
                    </label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.violationTime}
                      onChange={(e) =>
                        handleInputChange("violationTime", e.target.value)
                      }
                      required
                    />
                    <small
                      style={{
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                        display: "block",
                      }}
                    >
                      Par défaut: maintenant (modifiable)
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Violation</label>
                    <select
                      className="form-select"
                      value={formData.violationId}
                      onChange={(e) =>
                        handleInputChange("violationId", e.target.value)
                      }
                      required
                    >
                      <option value="">Sélectionner une violation</option>
                      {violations.map((violation) => (
                        <option key={violation.id} value={violation.id}>
                          {violation.violation_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sanction</label>
                    <select
                      className="form-select"
                      value={formData.punishmentId}
                      onChange={(e) =>
                        handleInputChange("punishmentId", e.target.value)
                      }
                      required
                    >
                      <option value="">Sélectionner une sanction</option>
                      {punishments.map((punishment) => (
                        <option key={punishment.id} value={punishment.id}>
                          {punishment.punishment_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => closeModal("addViolationRecord")}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Violation Modal */}
        {modals.addViolation && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">Ajouter une nouvelle violation</h3>
                <button
                  className="modal-close"
                  onClick={() => closeModal("addViolation")}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Nom de la violation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newViolation}
                    onChange={(e) => setNewViolation(e.target.value)}
                    placeholder="Ex: Retard en classe"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => closeModal("addViolation")}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddViolation}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Punishment Modal */}
        {modals.addPunishment && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">Ajouter une nouvelle sanction</h3>
                <button
                  className="modal-close"
                  onClick={() => closeModal("addPunishment")}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Nom de la sanction</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newPunishment}
                    onChange={(e) => setNewPunishment(e.target.value)}
                    placeholder="Ex: Avertissement écrit"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => closeModal("addPunishment")}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddPunishment}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationForm;
