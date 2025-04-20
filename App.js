import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [skip, setSkip] = useState(0);
  const [location, setLocation] = useState(null);

  const fetchResults = async (newSkip = 0) => {
    if (!location) return alert("Location not available");

    const res = await axios.post("https://your-render-api-url.com/search", {
      query,
      userLat: location.lat,
      userLng: location.lng,
      skip: newSkip
    });

    setResults(prev => newSkip === 0 ? res.data : [...prev, ...res.data]);
    setSkip(newSkip + 3);
  };

  const handleSearch = () => {
    setSkip(0);
    fetchResults(0);
  };

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  return (
    <div className="p-4">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search shops/services..."
        className="border p-2 mr-2"
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2">Search</button>

      <div className="mt-4 space-y-4">
        {results.map((item, idx) => (
          <div key={idx} className="border p-4 rounded shadow">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p>{item.address}</p>
            <div className="flex space-x-4 mt-2">
              <a href={`tel:${item.phone}`} title="Call">📞</a>
              <a href={`https://wa.me/${item.whatsapp}`} title="WhatsApp">💬</a>
              <a href={`https://maps.google.com/?q=${item.lat},${item.lng}`} title="Directions">📍</a>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <button onClick={() => fetchResults(skip)} className="mt-4 bg-gray-300 px-4 py-2">Load More</button>
      )}
    </div>
  );
}

export default App;
