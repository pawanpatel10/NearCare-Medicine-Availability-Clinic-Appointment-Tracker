import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  // ⏳ Wait for auth to load
  if (loading) return null;

  // 🔐 Not logged in - redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 🟡 User is authenticated but has no role
  if (!userRole) {
    // If we don't have a role, we can't really do anything.
    // Redirect to login or show a "Contact Support" / "Error" state.
    // For now, let's redirect to login to force a refresh/re-check.
    return <Navigate to="/login" replace />;
  }

  // ✅ If no role restrictions specified, allow access
  if (!allowedRoles) {
    return children;
  }

  // ✅ Check if user's role is in the allowed list
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // 🚫 Role mismatch - redirect to appropriate dashboard
  if (userRole === "clinic") {
    return <Navigate to="/doctor-dashboard" replace />;
  }
  if (userRole === "pharmacy") {
    return <Navigate to="/pharmacy-dashboard" replace />;
  }
  if (userRole === "user") {
    return <Navigate to="/home" replace />;
  }

  // Fallback: unknown role, go to login
  return <Navigate to="/login" replace />;
}

// Component for public routes (login/signup) that redirect authenticated users
export function PublicRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  // ⏳ Wait for auth
  if (loading) return null;

  // If user is logged in with a valid role, redirect to their dashboard
  if (currentUser && userRole) {
    if (userRole === "clinic")
      return <Navigate to="/doctor-dashboard" replace />;
    if (userRole === "pharmacy")
      return <Navigate to="/pharmacy-dashboard" replace />;
    if (userRole === "user") return <Navigate to="/home" replace />;
  }

  // If logged in but no role, redirect to login
  if (currentUser && !userRole) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Not logged in, allow access to public route
  return children;
}
