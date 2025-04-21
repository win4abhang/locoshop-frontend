import React, { useEffect, useState } from 'react';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query) {
      fetch(`https://locoshop-backend.onrender.com/api/stores/search?q=${query}`)
        .then(response => response.json())
        .then(data => setStores(data))
        .catch(error => console.error('Error fetching stores:', error));
    }
  }, [query]);

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

      {stores.map(store => (
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Call icon on left */}
            <a
              href={`tel:${store.phone}`}
              style={{
                textDecoration: 'none',
                color: '#000',
                fontSize: '18px'
              }}
              title="Call"
            >
              📞
            </a>

            {/* Phone number in the center */}
            <span style={{ flex: 1, fontWeight: '500', color: '#444' }}>
              {store.phone}
            </span>

            {/* WhatsApp icon on right */}
            <a
              href={`https://wa.me/${store.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: '#25D366',
                fontSize: '18px'
              }}
              title="WhatsApp"
            >
              💬
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoreList;
