import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('https://prosperv21.pythonanywhere.com/api/signin', {
                email: email,
                password: password
            });

            setSuccess('Login successful!');
            
            // Store user data and token
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
            
            // Redirect after 1 second to show success message
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            setLoading(false);
            if (error.response) {
                // Handle different error statuses from backend
                switch (error.response.status) {
                    case 400:
                        setError('Email and password are required!');
                        break;
                    case 401:
                        setError('Wrong password!');
                        break;
                    case 404:
                        setError('User not found!');
                        break;
                    default:
                        setError('Login failed. Please try again.');
                }
            } else {
                setError('Network error. Please check your connection.');
            }
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
                }}>Log in</h2>
                
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {loading && <p style={{ color: '#17a2b8', textAlign: 'center' }}>Authenticating...</p>}
                    {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}
                    {error && <p style={{ color: '#dc3545', textAlign: 'center' }}>{error}</p>}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                            backgroundColor: loading ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            marginTop: '8px'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                    
                    <p style={{ textAlign: 'center', marginTop: '16px' }}>
                        Don't have an account? <a href="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Sign up</a>
                    </p>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '8px',
                        margin: '8px 0'
                    }}>
                        <a href="/forgot-password" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px' }}>Forgot password?</a>
                    </div>
                    
                    <p style={{ 
                        fontSize: '12px', 
                        color: '#6c757d', 
                        textAlign: 'center',
                        marginTop: '24px'
                    }}>
                        Protected by reCAPTCHA and subject to Google's <a href="https://policies.google.com/terms" style={{ color: '#007bff', textDecoration: 'none' }}>Terms of Service</a> and <a href="https://policies.google.com/privacy" style={{ color: '#007bff', textDecoration: 'none' }}>Privacy Policy</a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signin;
