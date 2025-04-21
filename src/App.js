import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://locoshop-backend.onrender.com'; // your deployed backend URL

function App() {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        alert(`✅ Location fetched:\nLat: ${lat}\nLng: ${lng}`);
        console.log('✅ Location:', lat, lng);
      },
      (err) => {
        alert('❌ Location access denied. Using default location: Pune');
        console.error('Geolocation error:', err.message);
        setLocation({ lat: 18.5204, lng: 73.8567 }); // Fallback to Pune
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!location.lat || !location.lng) {
      alert("📍 Location not ready yet. Please wait and try again.");
      return;
    }

    setLoading(true);
    try {
      setPage(1);
      const res = await fetch(
        `${BACKEND_URL}/api/stores/search?query=${query}&lat=${location.lat}&lng=${location.lng}&page=1`
      );

      if (!res.ok) {
        alert("❌ Error fetching data from server.");
        return;
      }

      const data = await res.json();

      if (data.length === 0) {
        alert("😕 No stores found for this search.");
      }

      setStores(data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Network error or server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!location.lat || !location.lng) {
      alert("📍 Location not ready yet.");
      return;
    }

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `${BACKEND_URL}/api/stores/search?query=${query}&lat=${location.lat}&lng=${location.lng}&page=${nextPage}`
      );

      if (!res.ok) {
        alert("❌ Error fetching more data.");
        return;
      }

      const data = await res.json();
      setStores((prev) => [...prev, ...data]);
      setPage(nextPage);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Could not load more data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Locoshop</h1>
      <div>
        <input
          type="text"
          value={query}
          placeholder="Search like bike repair, shoes..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      <div>
        {stores.length === 0 && !loading && (
          <p>No stores found for this search.</p>
        )}
        {stores.map((store, index) => (
          <div key={index} className="card">
            <h3>{store.name}</h3>
            <p>{store.address}</p>
            <a href={`tel:${store.phone}`} target="_blank" rel="noreferrer">📞</a>
            <a href={`https://wa.me/${store.phone}`} target="_blank" rel="noreferrer">💬</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`} target="_blank" rel="noreferrer">🧭</a>
          </div>
        ))}
      </div>

      {stores.length > 0 && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}

export default App;
