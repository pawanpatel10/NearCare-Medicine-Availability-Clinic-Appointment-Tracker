import "./ClinicHome.css";

export default function ClinicHome() {
  return (
    <div className="clinic-container">
      {/* Header */}
      <header className="clinic-header">
        <h1>Clinic Dashboard</h1>
        <button className="logout-btn">Logout</button>
      </header>

      {/* Welcome */}
      <section className="clinic-welcome">
        <h2>Welcome, Doctor 👋</h2>
        <p>Manage appointments and clinic schedule</p>
      </section>

      {/* Dashboard Cards */}
      <section className="clinic-actions">
        <div className="clinic-card">
          <h3>Today’s Appointments</h3>
          <p>View and manage today’s patient bookings</p>
          <button>View Appointments</button>
        </div>

        <div className="clinic-card">
          <h3>Manage Time Slots</h3>
          <p>Add, edit, or remove available slots</p>
          <button>Manage Slots</button>
        </div>

        <div className="clinic-card">
          <h3>Patient Records</h3>
          <p>View basic patient appointment history</p>
          <button>View Records</button>
        </div>

        <div className="clinic-card">
          <h3>Clinic Profile</h3>
          <p>Update clinic details and availability</p>
          <button>Edit Profile</button>
        </div>
      </section>
    </div>
  );
}
