import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StoreList = ({ query, userLocation }) => {
  const [stores, setStores] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      if (!query || !userLocation) return;
      try {
        const response = await axios.get(
          `https://locoshop-backend.onrender.com/api/stores/search`,
          {
            params: {
              query,
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          }
        );
        setStores(response.data);
        setVisibleCount(3);
        setAllLoaded(response.data.length <= 3);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, [query, userLocation]);

  const handleShowMore = () => {
    const newVisibleCount = visibleCount + 3;
    setVisibleCount(newVisibleCount);
    if (newVisibleCount >= stores.length) {
      setAllLoaded(true);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {stores.slice(0, visibleCount).map((store) => (
        <div key={store._id} className="bg-white shadow-md rounded-xl p-4 space-y-2 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{store.name}</h2>
          <p className="text-sm text-gray-600">{store.address}</p>
          <p className="text-sm text-gray-600">Phone: {store.phone}</p>
          <div className="flex space-x-2 mt-2">
            <a
              href={`tel:${store.phone}`}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
            >
              Call
            </a>
            <a
              href={`https://wa.me/${store.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800"
            >
              Directions
            </a>
          </div>
        </div>
      ))}
      {!allLoaded && stores.length > visibleCount && (
        <div className="text-center">
          <button
            onClick={handleShowMore}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
          >
            Show More
          </button>
        </div>
      )}
      {stores.length === 0 && query && (
        <p className="text-center text-gray-500 mt-4">No stores found for "{query}"</p>
      )}
    </div>
  );
};

export default StoreList;
