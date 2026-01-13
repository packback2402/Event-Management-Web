import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactElement;
  /**
   * Nếu truyền role = 'admin' → yêu cầu user.role === 'admin'
   * Nếu không truyền role        → chỉ cần đăng nhập (có token + user hợp lệ)
   */
  role?: "admin" | "user";
}

/**
 * Route guard dùng chung cho mọi khu vực cần đăng nhập.
 * - Nếu không có token/user → redirect /login
 * - Nếu có role='admin' mà user.role !== 'admin' → redirect /events
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children, role }) => {
  const location = useLocation();

  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userRaw);

    if (role === "admin" && user.role !== "admin") {
      return <Navigate to="/events" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RequireAuth;


