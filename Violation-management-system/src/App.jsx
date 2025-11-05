import ViolationForm from "./pages/ViolationForm/ViolationForm";
import Statistiques from "./pages/Statistiques/Statistiques";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";

import React from "react";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ViolationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Statistiques"
        element={
          <ProtectedRoute>
            <Statistiques />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
