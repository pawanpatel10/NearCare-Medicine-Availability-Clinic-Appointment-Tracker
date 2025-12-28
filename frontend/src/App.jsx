import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // <--- Import this

// Import all your pages
import Login from './components/Login';
import Signup from './components/Signup';
import UserHome from './components/UserHome';
import ClinicHome from './components/ClinicHome';
import PharmacyHome from './components/PharmacyHome';
import CompleteProfile from './components/CompleteProfile';
import InventoryScanner from './components/InventoryScanner';
import PharmacyInventory from './components/PharmacyInventory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
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

        {/* 2. Doctor Routes */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['clinic']}>
              <ClinicHome />
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