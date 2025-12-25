import { useState } from "react";
import "./auth.css";

 function Signup() {
  const [form, setForm] = useState({
    role: "user",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <label>Account Type</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="clinic">Clinic</option>
        </select>

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter full name"
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create password"
          onChange={handleChange}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          onChange={handleChange}
          required
        />

        <button type="submit">Sign Up</button>
        <p className="link">Already have an account? Login</p>
      </form>
    </div>
  );
}

export default Signup
