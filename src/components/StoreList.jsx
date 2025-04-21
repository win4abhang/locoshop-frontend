import React, { useEffect, useState } from 'react';

const StoreList = () => {
  const [allStores, setAllStores] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query) {
      fetch(`https://locoshop-backend.onrender.com/api/stores/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
          setAllStores(data);
          setVisibleCount(3); // Reset on new search
        })
        .catch(error => console.error('Error fetching stores:', error));
    }
  }, [query]);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const visibleStores = allStores.slice(0, visibleCount);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <input
        type="text"
        placeholder="🔍 Search for a store (e.g., bike repair, puncture)..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '20px'
        }}
      />

      {visibleStores.map(store => (
        <div
          key={store._id}
          style={{
            border: '1px solid #eee',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#fff'
          }}
        >
          <h2 style={{ margin: '0 0 10px', color: '#333' }}>{store.name}</h2>
          <p style={{ margin: '0 0 6px', color: '#555' }}>{store.address}</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {/* Call Button */}
            <a
              href={`tel:${store.phone}`}
              style={{
                textDecoration: 'none',
                fontSize: '18px',
                padding: '8px 10px',
                backgroundColor: '#f1f1f1',
                borderRadius: '8px'
              }}
              title="Call"
            >
              📞 Call
            </a>

            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${store.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                fontSize: '18px',
                padding: '8px 10px',
                backgroundColor: '#dcf8c6',
                borderRadius: '8px',
                color: '#25D366'
              }}
              title="WhatsApp"
            >
              💬 Chat
            </a>

            {/* Direction Button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                fontSize: '18px',
                padding: '8px 10px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                color: '#4285F4'
              }}
              title="Get Directions"
            >
              📍 Direction
            </a>
          </div>
        </div>
      ))}

      {/* Show More Button */}
      {visibleCount < allStores.length && (
        <button
          onClick={handleShowMore}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default StoreList;
