import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const [emailUsername, setEmailUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading('Please wait...');
        try {
            const data = new FormData();
            data.append('email', emailUsername);
            data.append('password', password);

            const response = await axios.post('https://oprahjane16.pythonanywhere.com/api/signin', data);

            setLoading('');

            if (response.data.user) {
                setSuccess('Login Success');
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/');
            } else {
                setError('Login Failed');
            }
        } catch (error) {
            setLoading('');
            setError('Something went wrong!');
        }

        console.log({ emailUsername, password });
        setEmailUsername('');
        setPassword('');
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
                    {loading && <p style={{ color: '#17a2b8', textAlign: 'center' }}>{loading}</p>}
                    {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}
                    {error && <p style={{ color: '#dc3545', textAlign: 'center' }}>{error}</p>}

                    <input
                        type="text"
                        placeholder="Email or username"
                        value={emailUsername}
                        onChange={(e) => setEmailUsername(e.target.value)}
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
                        style={{
                            padding: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginTop: '8px'
                        }}
                    >
                        Log in
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
                        <a href="/forgot-username" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '14px' }}>Forgot username?</a>
                        <span style={{ color: '#6c757d' }}>|</span>
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