import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://dairydirect-1.onrender.com";

function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        name,
        phone,
        password,
        role,
      });

      alert("Registered successfully");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page">
      <div className="auth-box">
        <div className="auth-tabs">
          <button className="auth-tab" onClick={() => navigate("/")}>
            Login
          </button>
          <button className="auth-tab active">Register</button>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtext">Choose customer or admin role</p>

        <label>Name</label>
        <input
          className="input"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Phone</label>
        <input
          className="input"
          placeholder="Enter phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Role</label>
        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>

        <div className="auth-actions">
          <button className="btn btn-primary" onClick={handleRegister}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;