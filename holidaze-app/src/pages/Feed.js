import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../scripts/module.user';
import { showNetworkError } from '../scripts/module.messagebox';
import { setupNavbar } from '../scripts/module.navbar';

function Feed() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser(false);
    setUser(currentUser);
    setupNavbar();
    loadVenues();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleSearch = () => {
    loadVenues(searchQuery);
  };

  const loadVenues = async (search = "") => {
    try {
      const venues = await fetchVenues();
      const filteredVenues = venues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(search.toLowerCase()) ||
          venue.description.toLowerCase().includes(search.toLowerCase())
      );
      setVenues(filteredVenues);
    } catch (error) {
      showNetworkError(error.message);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues`);
      if (!response.ok) throw new Error('Failed to fetch venues');
      return await response.json();
    } catch (error) {
      showNetworkError("An error occurred while fetching venues.");
      return [];
    }
  };

  const handleCardClick = (venueId) => {

    navigate(`/venue/${venueId}`);
  };

  return (
    <div>
      <nav className="navbar border-bottom">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <img id='user_avatar' src={user?.avatar || ''} alt="User Avatar" className="rounded-circle" />
            <span id="user_name" className="navbar-brand">{user?.name || "Guest"}</span>
            {user?.venueManager && (
              <button id="createVenueBtn" className="btn btn-primary" onClick={() => window.location.href = './CreateVenue'}>
                Create Venue
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => window.location.href = './bookings'}>
              View Bookings
            </button>
          </div>
          <div className="search-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <header className="text-center py-4 pt-5 pb-5" id='welcome'>
        <h1>Welcome to Holidaze</h1>
        <p>Find the perfect venue for your next event!</p>
      </header>

      <main className="container mt-5">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {venues.length > 0 ? (
            venues.map((venue) => (
              <div className="col" key={venue.id}>

                <div className="card h-100 shadow-sm" onClick={() => handleCardClick(venue.id)} style={{ cursor: 'pointer' }}>
                  <img
                    className="card-img-top"
                    src={venue.media.length > 0 ? venue.media[0] : "https://via.placeholder.com/150"}
                    alt={venue.media.length > 0 ? "Venue Image" : "No image available"}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{venue.name}</h5>
                    <p className="card-text">{venue.description}</p>
                    <p><strong>Price:</strong> ${venue.price}</p>
                    <p><strong>Max Guests:</strong> {venue.maxGuests}</p>
                    <p><strong>Rating:</strong> {venue.rating}</p>
                    <p><strong>Wi-Fi:</strong> {venue.meta.wifi ? "Yes" : "No"}</p>
                    <p><strong>Parking:</strong> {venue.meta.parking ? "Yes" : "No"}</p>
                    <p><strong>Breakfast:</strong> {venue.meta.breakfast ? "Yes" : "No"}</p>
                    <p><strong>Pets:</strong> {venue.meta.pets ? "Yes" : "No"}</p>
                    <p><strong>Location:</strong> {venue.location.city}, {venue.location.country}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center mt-4">No venues match your search.</p>
          )}
        </div>
      </main>

      <footer className="text-center py-4 bg-dark text-white">
        <p>&copy; 2024 Holidaze. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Feed;
