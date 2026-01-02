import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // <--- Import this
import "leaflet/dist/leaflet.css";


// Import all your pages
import Login from './components/Login';
import Signup from './components/Signup';
import EmailVerification from './components/EmailVerification';
import UserHome from './components/UserHome';
import BookAppointment from "./components/BookAppointment";
import ClinicBooking from "./components/ClinicBooking";
import MyAppointments from "./components/MyAppointments";
import ClinicHome from './components/ClinicHome';
import ClinicAppointments from './components/ClinicAppointments';
import ClinicSettings from "./components/ClinicSettings";
import PharmacyHome from './components/PharmacyHome';
import CompleteProfile from './components/CompleteProfile';
import InventoryScanner from './components/InventoryScanner';
import PharmacyInventory from './components/PharmacyInventory';
import UserFindMedicines from './components/UserFindMedicine';
import About from "./components/About";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/signup" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        
        {/* Helper Route (Accessible by logged in users only, any role) */}
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute allowedRoles={['user', 'clinic', 'pharmacy', '']}>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />

        {/* --- PROTECTED ROUTES --- */}

        {/* 1. Patient Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search-medicines" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserFindMedicines />
            </ProtectedRoute>
          } 
        />

        <Route path="/about" element={<About />} />
        
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointment/:clinicId"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ClinicBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        {/* 2. Doctor Routes */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['clinic']}>
              <ClinicHome />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/doctor-dashboard/appointments"
          element={
            <ProtectedRoute allowedRoles={['clinic']}>
              <ClinicAppointments />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/doctor-dashboard/settings"
          element={
            <ProtectedRoute allowedRoles={['clinic']}>
              <ClinicSettings />
            </ProtectedRoute>
          }
        />

        {/* 3. Pharmacy Routes (Dashboard + Scanner) */}
        <Route 
          path="/pharmacy-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['pharmacy']}>
              <PharmacyHome />
            </ProtectedRoute>
          } 
        />

        <Route 
  path="/pharmacy/inventory" 
  element={
    <ProtectedRoute allowedRoles={['pharmacy']}>
      <PharmacyInventory />
    </ProtectedRoute>
  } 
/>
        
        {/* THE ONE YOU ASKED FOR: Only Pharmacy can see this */}
        <Route 
          path="/inventory-scanner" 
          element={
            <ProtectedRoute allowedRoles={['pharmacy']}>
              <InventoryScanner />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;