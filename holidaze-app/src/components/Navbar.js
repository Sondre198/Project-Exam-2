import React, { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../scripts/module.user';  // Adjust the path as needed
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser(false);
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser({ name: 'Guest' });
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');  // Redirect to login page after logout
  };

  return (
    <nav className="navbar border-bottom">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <img
            src={user?.avatar || 'default-avatar-url.jpg'}  // Provide a default avatar if none exists
            alt="User Avatar"
            className="rounded-circle"
            style={{ width: '50px', height: '50px' }}  // Adjust size as needed
          />
          <span className="navbar-brand">{user?.name}</span>

          {user?.venueManager && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/create-venue')}
            >
              Create Venue
            </button>
          )}
        </div>
        <div className="search-group">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleLogout}
          >
            {user ? 'Log out' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
