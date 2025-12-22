import ViolationForm from "./pages/ViolationForm/ViolationForm";
import Statistiques from "./pages/Statistiques/Statistiques";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
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

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <ViolationForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
