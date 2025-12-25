import "./PharmacyHome.css";

export default function PharmacyHome() {
  return (
    <div className="pharmacy-container">
      {/* Header */}
      <header className="pharmacy-header">
        <h1>Pharmacy Dashboard</h1>
        <button className="logout-btn">Logout</button>
      </header>

      {/* Welcome */}
      <section className="pharmacy-welcome">
        <h2>Welcome 👋</h2>
        <p>Manage medicines and availability</p>
      </section>

      {/* Dashboard Cards */}
      <section className="pharmacy-actions">
        <div className="pharmacy-card">
          <h3>Medicine Inventory</h3>
          <p>Add, update, or remove medicines</p>
          <button>Manage Inventory</button>
        </div>

        <div className="pharmacy-card">
          <h3>Stock Availability</h3>
          <p>Update available quantities</p>
          <button>Update Stock</button>
        </div>

        <div className="pharmacy-card">
          <h3>Medicine Requests</h3>
          <p>View searched medicines nearby users need</p>
          <button>View Requests</button>
        </div>

        <div className="pharmacy-card">
          <h3>Pharmacy Profile</h3>
          <p>Edit pharmacy details & timings</p>
          <button>Edit Profile</button>
        </div>
      </section>
    </div>
  );
}
