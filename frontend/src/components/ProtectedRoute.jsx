import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// allowedRoles can be a string like "pharmacy" or an array ["clinic", "pharmacy"]
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  // 1. Wait for Auth to check status (prevent kicking user out while loading)
  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // 2. Not Logged In? -> Go to Login
  if (!currentUser) return <Navigate to="/login" replace />;

  // 3. Logged in but Wrong Role? -> Kick them out
  // (e.g. A "Patient" trying to access "Pharmacy Dashboard")
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the page that matches their ACTUAL role
    if (userRole === "clinic") return <Navigate to="/doctor-dashboard" replace />;
    if (userRole === "pharmacy") return <Navigate to="/pharmacy-dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  // 4. Access Granted! Render the page.
  return children;
}