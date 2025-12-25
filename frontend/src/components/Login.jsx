import { useState } from "react";
import "./auth.css";

 function Login() {
  const [form, setForm] = useState({
    role: "user",
    email: "",
    password: "",
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
        <h2>Login</h2>

        <label>User Type</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="clinic">Clinic</option>
        </select>

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
          placeholder="Enter password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
        <p className="link">Forgot password?</p>
        
      </form>
    </div>
  );
}
export default Login
