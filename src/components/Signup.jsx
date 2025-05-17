import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('https://prosperv21.pythonanywhere.com/api/signup', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });

            setSuccess('Account created successfully! Redirecting...');
            localStorage.setItem('token', response.data.token);

            setTimeout(() => {
                navigate('/');
            }, 1500);
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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                width: '100%',
                maxWidth: '450px'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                    color: '#333'
                }}>Sign Up</h2>

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {loading && <p style={{ color: '#17a2b8', textAlign: 'center' }}>Creating account...</p>}
                    {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}
                    {error && <p style={{ color: '#dc3545', textAlign: 'center' }}>{error}</p>}

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone (Optional)"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '16px'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px',
                            backgroundColor: loading ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            marginTop: '8px'
                        }}
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '16px' }}>
                        Already have an account? <a href="/signin" style={{ color: '#007bff', textDecoration: 'none' }}>Log in</a>
                    </p>

                    <p style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        textAlign: 'center',
                        marginTop: '24px'
                    }}>
                        By signing up, you agree to our <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>Terms</a> and <a href="#" style={{ color: '#007bff', textDecoration: 'none' }}>Privacy Policy</a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
