import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { user, loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const loggedInUser = await handleLogin({ email, password });
            if (loggedInUser) {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main>
                <h1>Loading...</h1>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                {error && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "rgba(255, 45, 120, 0.15)",
                        border: "1px solid #ff2d78",
                        borderRadius: "0.5rem",
                        color: "#ff6b9d",
                        fontSize: "0.85rem",
                        marginBottom: "1rem"
                    }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); }}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="button primary-button"
                    >
                        {submitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    );
};

export default Login;