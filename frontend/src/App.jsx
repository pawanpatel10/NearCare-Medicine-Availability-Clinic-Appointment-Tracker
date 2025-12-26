import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all your pages
import Login from './components/Login';
import Signup from './components/Signup';
import UserHome from './components/UserHome';
import ClinicHome from './components/ClinicHome';
import PharmacyHome from './components/PharmacyHome';
import CompleteProfile from './components/CompleteProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route: Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboards (Targeted by your Login.js logic) */}
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/home" element={<UserHome />} />                 {/* For Patients */}
        <Route path="/doctor-dashboard" element={<ClinicHome />} />   {/* For Doctors */}
        <Route path="/pharmacy-dashboard" element={<PharmacyHome />} /> {/* For Chemists */}
        
        {/* Catch-all for 404s */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;