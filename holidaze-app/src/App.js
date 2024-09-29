import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles-custom.css';
import 'flatpickr/dist/flatpickr.min.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Venue from './pages/Venue';
import CreateVenue from './pages/CreateVenue';
import Bookings from './pages/Bookings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/venue/:id" element={<Venue />} />
        <Route path="/CreateVenue" element={<CreateVenue />} />
        <Route path="/bookings" element={<Bookings />} />
      </Routes>
    </Router>
  );
}

export default App;
