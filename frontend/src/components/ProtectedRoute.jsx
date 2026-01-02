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

  // 🟡 User is authenticated but has no role (needs to complete profile)
  // Only redirect if we're NOT already on complete-profile page
  if (!userRole) {
    if (location.pathname !== "/complete-profile") {
      return <Navigate to="/complete-profile" replace />;
    }
    // Allow access to complete-profile page
    return children;
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

  // Fallback: unknown role, go to complete-profile
  return <Navigate to="/complete-profile" replace />;
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

  // If logged in but no role, redirect to complete profile
  if (currentUser && !userRole) {
    return <Navigate to="/complete-profile" replace />;
  }

  // ✅ Not logged in, allow access to public route
  return children;
}
