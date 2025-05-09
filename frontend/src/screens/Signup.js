import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  // hooks to manage input fields, error handling and allow for navigation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // handle login submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // check if all fields are filled
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // sending signup request to backend API and redirect to login page
      await axios.post(`${API_URL}/signup`, { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.data || err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

 return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <h2 style={styles.title}>Signup</h2>
        {/* display error message if there is one */}
        {error && <p style={styles.error}>{error}</p>}

        {/* signup form */}
        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>
          {/* toggle to show/hide password */}
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label style={{ marginLeft: "5px" }}> Show Password</label>
          </div>
          <button type="submit" style={styles.button}>Signup</button>
        </form>
        {/* redirect to login page if user already has an account */}
        <div style={styles.loginContainer}>
          <Link to="/login" style={styles.loginLink}>Already have an account? Login here</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  container: {
    maxWidth: "80%",
    padding: "2.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "100%",
    textAlign: "center",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
    fontWeight: "bold",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: "1rem",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    marginTop: "5px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    textAlign: "left",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "1rem",
    marginTop: "10px",
    fontWeight: "bold",
  },
  loginContainer: {
    marginTop: "1rem",
  },
  loginLink: {
    color: "black",
    textDecoration: "underline",
  },
  error: {
    color: "red",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
};

export default Signup;