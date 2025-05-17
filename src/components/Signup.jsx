import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('https://prosperv21.pythonanywhere.com/api/signup', formData);
            setSuccess('Account created successfully!');
            localStorage.setItem('token', response.data.token);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setLoading(false);
            if (err.response?.status === 409) {
                setError('Email already registered.');
            } else {
                setError(err.response?.data?.message || 'Signup failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2 className="signup-title">Create an Account</h2>

                <form className="signup-form" onSubmit={handleSubmit}>
                    {loading && <p className="signup-message" style={{ color: '#17a2b8' }}>Creating account...</p>}
                    {success && <p className="signup-message" style={{ color: '#28a745' }}>{success}</p>}
                    {error && <p className="signup-message" style={{ color: '#dc3545' }}>{error}</p>}

                    <input
                        className="signup-input"
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="signup-input"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="signup-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="signup-input"
                        type="tel"
                        name="phone"
                        placeholder="Phone (optional)"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="signup-button"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>

                    <p className="signup-link">
                        Already have an account? <a href="/signin">Log in</a>
                    </p>

                    <p className="signup-terms">
                        By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
