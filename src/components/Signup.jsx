import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
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
            data.append("firstname", formData.firstName);
            data.append("lastname", formData.lastName);
            data.append("email", formData.email);
            data.append("password", formData.password);

            const response = await axios.post(
                "https://prosperv21.pythonanywhere.com/api/signup", 
                data
            );

            setLoading("");
            setSuccess(response.data.Success || "Signup successful!");
            
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
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
                maxWidth: '500px'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '8px',
                    color: '#333',
                    fontSize: '24px'
                }}>Create Your Account</h2>
                <p style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                    color: '#666'
                }}>Join us to get started</p>
                
                {loading && <p style={{
                    color: '#17a2b8',
                    textAlign: 'center',
                    margin: '16px 0'
                }}>{loading}</p>}
                {error && <p style={{
                    color: '#dc3545',
                    textAlign: 'center',
                    margin: '16px 0'
                }}>{error}</p>}
                {success && <p style={{
                    color: '#28a745',
                    textAlign: 'center',
                    margin: '16px 0'
                }}>{success}</p>}

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '16px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                    width: '100%'
                                }}
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
                            style={{
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                width: '100%'
                            }}
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
                            style={{
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                width: '100%'
                            }}
                        />
                        <div style={{
                            marginTop: '8px',
                            fontSize: '14px'
                        }}>
                            <p style={{
                                color: passwordCriteria.length ? '#28a745' : '#6c757d',
                                margin: '4px 0'
                            }}>
                                ✓ Minimum 8 characters
                            </p>
                            <p style={{
                                color: passwordCriteria.letter ? '#28a745' : '#6c757d',
                                margin: '4px 0'
                            }}>
                                ✓ At least one letter
                            </p>
                            <p style={{
                                color: passwordCriteria.number ? '#28a745' : '#6c757d',
                                margin: '4px 0'
                            }}>
                                ✓ At least one number
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '8px 0'
                    }}>
                        <input
                            type="checkbox"
                            name="subscribe"
                            checked={formData.subscribe}
                            onChange={handleChange}
                            style={{
                                marginRight: '8px'
                            }}
                        />
                        <span style={{ fontSize: '14px' }}>
                            Send me weekly emails with free resources
                        </span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
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
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '14px'
                    }}>
                        Already have an account? <a href="/login" style={{
                            color: '#007bff',
                            textDecoration: 'none'
                        }}>Sign in</a>
                    </p>

                    <p style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        textAlign: 'center',
                        marginTop: '24px'
                    }}>
                        Protected by reCAPTCHA and subject to Google's <a href="https://policies.google.com/terms" style={{
                            color: '#007bff',
                            textDecoration: 'none'
                        }}>Terms</a> and <a href="https://policies.google.com/privacy" style={{
                            color: '#007bff',
                            textDecoration: 'none'
                        }}>Privacy</a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;