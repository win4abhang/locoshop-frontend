// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://locoshop-backend.onrender.com'; // your deployed backend URL

const getLevenshteinDistance = (a, b) => {
  const tmp = [];
  for (let i = 0; i <= b.length; i++) tmp[i] = [i];
  for (let j = 0; j <= a.length; j++) tmp[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      tmp[i][j] =
        a[j - 1] === b[i - 1]
          ? tmp[i - 1][j - 1]
          : Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + 1);
    }
  }
  return tmp[b.length][a.length];
};

function App() {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const storeNames = stores.map(store => store.name);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
      },
      () => {
        setLocation({ lat: 18.5204, lng: 73.8567 }); // fallback
      }
    );
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = storeNames.filter(name =>
        getLevenshteinDistance(query.toLowerCase(), name.toLowerCase()) <= 3
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, storeNames]); // ✅ Fixed here

  const handleSearch = async () => {
    if (!location.lat || !location.lng) {
      alert("📍 Location not ready yet.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/stores/search?query=${query}&lat=${location.lat}&lng=${location.lng}&page=1`
      );

      if (!res.ok) {
        alert("❌ Error fetching data from server.");
        return;
      }

      const data = await res.json();
      setStores(data);
      setFilteredStores(data);
    } catch (err) {
      alert("❌ Network error or server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
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

        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleAutocompleteClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {filteredStores.map((store, index) => (
          <div key={index} className="card">
            <h3>{store.name}</h3>
            <p>{store.address}</p>
            <a href={`tel:${store.phone}`} target="_blank" rel="noreferrer">📞</a>
            <a href={`https://wa.me/${store.phone}`} target="_blank" rel="noreferrer">💬</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`} target="_blank" rel="noreferrer">🧭</a>
          </div>
        ))}
      </div>

      {filteredStores.length > 0 && (
        <button onClick={() => setPage(page + 1)}>Load More</button>
      )}
    </div>
  );
}

export default App;
