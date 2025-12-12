import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
  return localStorage.getItem("token") ? true : false;
};

const PublicRoute = () => {
  const isAuth = useAuth();

  return isAuth ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
