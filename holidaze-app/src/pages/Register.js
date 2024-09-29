import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../scripts/module.user';
import { showMessageBox } from '../scripts/module.messagebox';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [venueManager, setVenueManager] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userDetails = { name, email, password, avatar: avatar || undefined, venueManager };

    try {
      await register(userDetails);
      navigate('/feed');
    } catch (error) {
      console.error("Error during registration:", error);
      showMessageBox("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <form id="registerForm" className="bg-white p-4 shadow-lg rounded" onSubmit={handleSubmit}>
        <h1 className="mb-4">Register</h1>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            name="name"
            id="name"
            minlength="3"
            className="form-control"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="avatar" className="form-label">Profile picture</label>
          <input
            name="avatar"
            id="avatar"
            type="url"
            className="form-control"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="registerAsManager"
            name="venueManager"
            checked={venueManager}
            onChange={(e) => setVenueManager(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="registerAsManager">
            Register as a Venue Manager
          </label>
        </div>
        <button type="submit" className="btn btn-primary">Create Account</button>
        <p className="mt-3">Already have an account? <a href="/login">Log in</a></p>
      </form>
    </div>
  );
}

export default Register;
