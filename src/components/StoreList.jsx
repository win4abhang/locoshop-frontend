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
    <div>
      <input
        type="text"
        placeholder="Search stores..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {stores.map(store => (
        <div key={store._id}>
          <h2>{store.name}</h2>
          <p>{store.address}</p>
		  <p>{store.phone}</p>
        </div>
      ))}
    </div>
  );
};

export default StoreList;
