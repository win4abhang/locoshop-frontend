import React, { useState } from "react";

const StoreList = ({ stores, searchQuery }) => {
  const [visibleCount, setVisibleCount] = useState(3);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  if (!searchQuery.trim()) return null;

  return (
    <div className="flex flex-col gap-4 mt-6">
      {stores.slice(0, visibleCount).map((store, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2"
        >
          <h3 className="text-lg font-semibold text-gray-800">{store.name}</h3>
          <p className="text-gray-600">{store.address}</p>
          <div className="flex gap-3 mt-2">
            <a
              href={`tel:${store.phone}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Call
            </a>
            <a
              href={`https://wa.me/${store.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                store.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Directions
            </a>
          </div>
        </div>
      ))}

      {visibleCount < stores.length && (
        <button
          onClick={handleShowMore}
          className="mt-4 mx-auto bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default StoreList;
