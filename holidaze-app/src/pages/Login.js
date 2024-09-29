import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../scripts/module.user';
import { showNetworkError } from '../scripts/module.messagebox';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const user = getCurrentUser(false);
    if (user) {
      navigate('/feed');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/feed');
    } catch (error) {
      showNetworkError(error);
    }
  };

  return (
    <div className="container mt-5">
      <form className="bg-white p-4 shadow-lg rounded" onSubmit={handleLogin}>
        <h1 className="mb-4">Login</h1>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            name="email"
            id="email"
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            name="password"
            id="password"
            type="password"
            className="form-control"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Log in</button>
        <p className="mt-3">Don't have an account? <a href="/register">Create Account</a></p>
        <p className="mt-3"><a href="/feed">Continue as a guest</a></p>
      </form>
    </div>
  );
}

export default Login;