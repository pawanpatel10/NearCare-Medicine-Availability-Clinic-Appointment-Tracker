import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  // ⏳ Wait for auth
  if (loading) return null;

  // 🔐 Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 🟡 Allow access to complete-profile even if role is null
  if (!userRole) {
    return children;
  }

  // 🚫 Role mismatch
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "clinic") return <Navigate to="/doctor-dashboard" replace />;
    if (userRole === "pharmacy") return <Navigate to="/pharmacy-dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  // ✅ Access granted
  return children;
}
