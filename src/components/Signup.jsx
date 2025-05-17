import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    subscribe: true
  });
  
  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    letter: false,
    number: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password') {
      setPasswordCriteria({
        length: value.length >= 8,
        letter: /[a-zA-Z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("Please wait as we process your details");
    setSuccess("");
    setError("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("subscribe", formData.subscribe);

      const response = await axios.post(
        "https://prosperv21.pythonanywhere.com/api/signup", 
        data
      );

      setLoading("");
      setSuccess(response.data.Success || "Signup successful!");
      
      // Reset form
      setFormData({
        username: '',
        phone: '',
        email: '',
        password: '',
        subscribe: true
      });
    } catch (error) {
      setLoading("");
      setError(error.response?.data?.message || "Oops, something happened. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Sign Up</h2>

      {loading && <p style={{ color: '#17a2b8', textAlign: 'center' }}>{loading}</p>}
      {error && <p style={{ color: '#dc3545', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          <p style={{ color: passwordCriteria.length ? '#28a745' : '#6c757d', margin: '4px 0' }}>
            ✓ Minimum 8 characters
          </p>
          <p style={{ color: passwordCriteria.letter ? '#28a745' : '#6c757d', margin: '4px 0' }}>
            ✓ At least one letter
          </p>
          <p style={{ color: passwordCriteria.number ? '#28a745' : '#6c757d', margin: '4px 0' }}>
            ✓ At least one number
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="checkbox"
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
          Subscribe to newsletter
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
};

const inputStyle = {
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '16px',
  width: '100%',
  marginBottom: '16px'
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  width: '100%'
};

export default Signup;
