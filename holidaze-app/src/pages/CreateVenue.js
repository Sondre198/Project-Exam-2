import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../scripts/module.user';
import { showNetworkError, showMessageBox } from '../scripts/module.messagebox';

function CreateVenue() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    maxGuests: '',
    media: '',
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
    city: '',
    country: '',
  });
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user || !user.venueManager) {
      showMessageBox("You are not authorized to create a venue.");
      return;
    }

    const venueDetails = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      maxGuests: parseInt(formData.maxGuests),
      media: formData.media ? formData.media.split(",").map(url => url.trim()) : [],
      meta: {
        wifi: formData.wifi,
        parking: formData.parking,
        breakfast: formData.breakfast,
        pets: formData.pets,
      },
      location: {
        city: formData.city,
        country: formData.country,
      },
    };

    try {
      const response = await fetch(`https://api.noroff.dev/api/v1/holidaze/venues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(venueDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors.join(", "));
      }

      showMessageBox("Venue created successfully!");
      navigate('/feed');
    } catch (error) {
      showNetworkError(error.message);
      console.error("Error creating venue:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create a New Venue</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Venue Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="maxGuests" className="form-label">Max Guests</label>
          <input
            type="number"
            className="form-control"
            id="maxGuests"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="media" className="form-label">Media (URLs, comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="media"
            name="media"
            value={formData.media}
            onChange={handleInputChange}
          />
        </div>


        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="wifi"
            name="wifi"
            checked={formData.wifi}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="wifi">WiFi</label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="parking"
            name="parking"
            checked={formData.parking}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="parking">Parking</label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="breakfast"
            name="breakfast"
            checked={formData.breakfast}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="breakfast">Breakfast</label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="pets"
            name="pets"
            checked={formData.pets}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="pets">Pets Allowed</label>
        </div>

        <div className="mb-3">
          <label htmlFor="city" className="form-label">City</label>
          <input
            type="text"
            className="form-control"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="country" className="form-label">Country</label>
          <input
            type="text"
            className="form-control"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Venue</button>
      </form>
    </div>
  );
}

export default CreateVenue;
