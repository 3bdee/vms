import React from "react";
import { NavLink } from "react-router-dom";
import { School, LogOut, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("school_id");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo">
        <School size={32} color="#667eea" />
        <h1>Système de Gestion des Violations</h1>
      </div>
      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          Violations
        </NavLink>
        <NavLink
          to="/statistiques"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <BarChart3 size={16} />
          Statistiques
        </NavLink>
        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={16} />
          Déconnexion
        </button>
      </nav>
    </header>
  );
}

export default Header;
