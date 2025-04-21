import React, { useState } from 'react';

const BACKEND_URL = 'https://locoshop-backend.onrender.com'; // Replace if needed

function AddShop() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    tags: '',
    lat: '',
    lng: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const data = {
      ...form,
      tags: form.tags.split(',').map(tag => tag.trim().toLowerCase()),
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
    };

    const res = await fetch(`${BACKEND_URL}/api/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert('Shop added!');
      setForm({ name: '', address: '', phone: '', tags: '', lat: '', lng: '' });
    } else {
      alert('Failed to add shop');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add New Shop</h2>
      <input name="name" placeholder="Shop Name" value={form.name} onChange={handleChange} /><br />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} /><br />
      <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} /><br />
      <input name="tags" placeholder="Tags (comma-separated)" value={form.tags} onChange={handleChange} /><br />
      <input name="lat" placeholder="Latitude" value={form.lat} onChange={handleChange} /><br />
      <input name="lng" placeholder="Longitude" value={form.lng} onChange={handleChange} /><br />
      <button onClick={handleSubmit}>Add Shop</button>
    </div>
  );
}

export default AddShop;
