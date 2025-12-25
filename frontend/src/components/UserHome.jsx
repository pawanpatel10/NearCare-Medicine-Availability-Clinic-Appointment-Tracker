import "./UserHome.css";

export default function UserHome() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>MediNexa</h1>
        <button className="logout-btn">Logout</button>
      </header>

      {/* Welcome */}
      <section className="welcome">
        <h2>Welcome 👋</h2>
        <p>Find medicines and book clinic appointments easily</p>
      </section>

      {/* Main Actions */}
      <section className="actions">
        <div className="card">
          <h3>Search Medicines</h3>
          <p>Check nearby pharmacies for medicine availability</p>
          <button>Find Medicines</button>
        </div>

        <div className="card">
          <h3>Book Appointment</h3>
          <p>Book clinic appointments without waiting</p>
          <button>Book Now</button>
        </div>

        <div className="card">
          <h3>My Appointments</h3>
          <p>View upcoming and past appointments</p>
          <button>View</button>
        </div>
      </section>
    </div>
  );
}
