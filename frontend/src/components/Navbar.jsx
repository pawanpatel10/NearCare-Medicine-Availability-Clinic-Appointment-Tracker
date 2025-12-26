import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import "./Navbar.css"; // Create this CSS file (code below)

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Helper to determine where the "Dashboard" button leads
  const getDashboardLink = () => {
    if (userRole === "clinic") return "/doctor-dashboard";
    if (userRole === "pharmacy") return "/pharmacy-dashboard";
    return "/home"; // Default for patients
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          NearCare 🏥
        </Link>

        {/* Navigation Links */}
        <ul className="nav-menu">
          {!currentUser ? (
            // SHOW WHEN LOGGED OUT
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-links-mobile">Signup</Link>
              </li>
            </>
          ) : (
            // SHOW WHEN LOGGED IN
            <>
              <li className="nav-item">
                <Link to={getDashboardLink()} className="nav-links">
                  Dashboard
                </Link>
              </li>
              
              {/* Only show "My Appts" to Patients */}
              {userRole === 'user' && (
                <li className="nav-item">
                  <Link to="/my-appointments" className="nav-links">My Bookings</Link>
                </li>
              )}

              <li className="nav-item">
                <button onClick={handleLogout} className="logout-btn-nav">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;