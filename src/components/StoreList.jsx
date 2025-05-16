import React, { useEffect, useState, useRef } from "react";

const getDistance = (lat1, lon1, lat2, lon2) => {
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  if ([lat1, lon1, lat2, lon2].some(isNaN)) {
    console.error("Invalid coordinates:", { lat1, lon1, lat2, lon2 });
    return NaN;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [waitingForLocation, setWaitingForLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadCountMap, setLoadCountMap] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setWaitingForLocation(false);
      },
      (error) => {
        alert("Please allow location access to find nearby shops.");
        console.error("Error getting location:", error);
      }
    );
  }, []);

  const fetchStores = async (searchQuery, pageNum, lat, lng) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://locoshop-backend.onrender.com/api/stores/searchStores?query=${encodeURIComponent(
          searchQuery
        )}&page=${pageNum}&latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();

      if (Array.isArray(data.stores)) {
        setStores((prev) => (pageNum === 1 ? data.stores : [...prev, ...data.stores]));
        setHasMore(data.stores.length > 0 && pageNum < data.totalPages);
      } else {
        console.error("Unexpected response format:", data);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!location.latitude || !location.longitude) {
      alert("Location not available yet.");
      return;
    }
    setPage(1);
    setStores([]);
    fetchStores(query || "advertisement", 1, location.latitude, location.longitude);
    setLoadCountMap((prev) => ({
      ...prev,
      [query || "advertisement"]: 0,
    }));
  };

  const loadMore = () => {
    const searchKey = query || "advertisement";
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStores(searchKey, nextPage, location.latitude, location.longitude);
    setLoadCountMap((prev) => ({
      ...prev,
      [searchKey]: (prev[searchKey] || 0) + 1,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
      setSuggestions([]);
    }
  };

  const isValidPhone = (phone) => phone && phone !== "nan" && phone !== "0";

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://locoshop-backend.onrender.com/api/stores/autocomplete?query=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setSuggestions([]);
      }
    };
    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchKey = query || "advertisement";
  const currentLoadCount = loadCountMap[searchKey] || 0;

  if (waitingForLocation) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>Please allow location access to find nearby shops.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", width: "90%" }}>
      <h2 style={{ textAlign: "center" }}>Find nearby shops and services</h2>

      <div style={{ position: "relative" }} ref={suggestionsRef}>
        <input
          type="text"
          placeholder="🔍 Search (e.g., bike repair, puncture)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "10px",
            fontSize: "1rem",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: suggestions.length > 0 ? "0" : "10px",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderTop: "none",
              maxHeight: "180px",
              overflowY: "auto",
              zIndex: 1000,
              listStyle: "none",
              margin: 0,
              padding: 0,
              borderRadius: "0 0 8px 8px",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSearch}
        style={{
          marginBottom: "10px",
          padding: "10px",
          width: "100%",
          borderRadius: "8px",
          backgroundColor: "#5c6bc0",
          color: "#fff",
          fontSize: "1rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {isLoading && <p style={{ textAlign: "center" }}>Loading nearby stores...</p>}

      {stores.map((store) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          store.location.coordinates[1],
          store.location.coordinates[0]
        );
        return (
          <div
            key={store._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#fafafa",
            }}
          >
            <h3>{store.name} <span style={{ fontSize: "0.9rem", color: "#555" }}>({distance} km)</span></h3>
            <p>{store.address}</p>
            {isValidPhone(store.phone) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <a href={`tel:${store.phone}`}>📞 Call</a>
                <a href={`https://wa.me/91${store.phone}`} target="_blank" rel="noopener noreferrer">
                  💬 Chat
                </a>
              </div>
            )}
          </div>
        );
      })}

      {/* Show More button conditions */}
      {stores.length > 0 && currentLoadCount < 20 && hasMore && (
        <button
          onClick={loadMore}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#4caf50",
            color: "#fff",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Show More
        </button>
      )}

      {/* Message when no more stores are available */}
      {!hasMore && stores.length > 0 && (
        <p style={{ textAlign: "center", color: "#888", marginTop: "1rem" }}>
          No more stores to show.
        </p>
      )}
    </div>
  );
};

export default StoreList;
