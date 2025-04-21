import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = 'https://locoshop-backend.onrender.com';

// Levenshtein distance function
function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = 1 + Math.min(
          matrix[i - 1][j],
          matrix[i][j - 1],
          matrix[i - 1][j - 1]
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

function App() {
  const [query, setQuery] = useState('');
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [storeNames, setStoreNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        alert("Please allow location access.");
      }
    );
  }, []);

  useEffect(() => {
    // autocomplete filter
    if (query.length > 0) {
      const filtered = storeNames.filter(name =>
        name.toLowerCase().includes(query.toLowerCase()) ||
        getLevenshteinDistance(query.toLowerCase(), name.toLowerCase()) <= 2
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query, storeNames]);

  const handleSearch = async () => {
    if (!location.lat || !location.lng) {
      alert("📍 Location not ready yet.");
      return;
    }

    setPage(1);
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/stores/search?query=${query}&lat=${location.lat}&lng=${location.lng}&page=1`
      );

      if (!res.ok) {
        alert("❌ Error fetching data from server.");
        return;
      }

      let data = await res.json();

      const queryLower = query.toLowerCase();
      const fuzzyFiltered = data.filter((store) => {
        const name = store.name.toLowerCase();
        const tags = store.tags ? store.tags.join(" ").toLowerCase() : '';
        const combined = `${name} ${tags}`;

        return (
          combined.includes(queryLower) ||
          getLevenshteinDistance(queryLower, name) <= 2
        );
      });

      setStores(fuzzyFiltered);
      setStoreNames(data.map((s) => s.name)); // For autocomplete
    } catch (err) {
      alert("❌ Network error or server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${BACKEND_URL}/api/stores/search?query=${query}&lat=${location.lat}&lng=${location.lng}&page=${nextPage}`
    );
    const data = await res.json();
    setStores((prev) => [...prev, ...data]);
    setPage(nextPage);
  };

  const handleSuggestionClick = (suggestion) => {
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
          placeholder="Search like bike repair, shoes, etc."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        {suggestions.length > 0 && (
          <div className="autocomplete">
            {suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="suggestion"
                onClick={() => handleSuggestionClick(sug)}
              >
                {sug}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <p>Loading...</p>}

      <div>
        {stores.length === 0 && !loading && <p>No stores found for this search.</p>}
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

      {stores.length > 0 && !loading && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  );
}

export default App;
