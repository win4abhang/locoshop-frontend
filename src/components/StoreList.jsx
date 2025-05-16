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
  const [loadCount, setLoadCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setWaitingForLocation(false);
        // Removed alert as requested
      },
      (error) => {
        alert("Please allow location access to find nearby shops.");
        console.error("Error getting location:", error);
      }
    );
  }, []);

  // Fetch stores only on Search button click or Enter press
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

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadCount((prev) => prev + 1);
    fetchStores(query || "advertisement", nextPage, location.latitude, location.longitude);
  };

  const isValidPhone = (phone) => phone && phone !== "nan" && phone !== "0";

  // Handle Search button click or Enter key press
  const handleSearch = () => {
    if (!location.latitude || !location.longitude) {
      alert("Location not available yet.");
      return;
    }
    setStores([]);
    setPage(1);
    setLoadCount(0);
    fetchStores(query || "advertisement", 1, location.latitude, location.longitude);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
      setSuggestions([]);
    }
  };

  // Fetch autocomplete suggestions as user types
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

    // Debounce autocomplete calls by 300ms
    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  // Close suggestions dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (waitingForLocation) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Please allow location access to find nearby shops
        </p>
        <p>Waiting for location permission...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", width: "90%" }}>
      <p style={{ fontSize: "1.2rem", textAlign: "center" }}>
        Find nearby shops and services easily
      </p>

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
            boxSizing: "border-box",
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
                onMouseDown={(e) => e.preventDefault()} // prevent input blur
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {location.latitude && location.longitude && (
        <p style={{ fontSize: "0.9rem", textAlign: "center", color: "#555", marginBottom: "10px" }}>
          Your location: 📍 Latitude {location.latitude.toFixed(5)}, Longitude{" "}
          {location.longitude.toFixed(5)}
        </p>
      )}

      <button
        onClick={handleSearch}
        style={{
          marginBottom: "10px",
          padding: "10px 20px",
          backgroundColor: "#5c6bc0",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          width: "100%",
          cursor: "pointer",
          fontSize: "1rem",
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
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "15px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              backgroundColor: "#fff",
            }}
          >
            <h2 style={{ margin: "0 0 10px", color: "#333", fontSize: "1.2rem" }}>
              {store.name} <span style={{ fontSize: "0.9rem", color: "#666" }}>({distance} km)</span>
            </h2>
            <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.95rem" }}>{store.address}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {isValidPhone(store.phone) && (
                <>
                  <a href={`tel:${store.phone}`} style={buttonStyle("#e0f7fa", "#00796b")}>
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/91${store.phone.replace(/^0+/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={buttonStyle("#dcf8c6", "#25D366")}
                  >
                    💬 Chat
                  </a>
                </>
              )}
              <button
                onClick={() =>
                  store.lat && store.lng
                    ? window.open(
                        `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`,
                        "_blank"
                      )
                    : alert("Location not available for this store.")
                }
                style={buttonStyle("#e8eaf6", "#3f51b5", true)}
              >
                🧭 Direction
              </button>
            </div>
          </div>
        );
      })}

      {hasMore && loadCount < 20 && (
        <button
          onClick={loadMore}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#5c6bc0",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            width: "100%",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
};

const buttonStyle = (bg, color, isButton = false) => ({
  flex: "1 1 30%",
  padding: "8px 10px",
  backgroundColor: bg,
  borderRadius: "8px",
  color: color,
  textDecoration: "none",
  textAlign: "center",
  fontSize: "0.9rem",
  border: isButton ? "none" : undefined,
  cursor: isButton ? "pointer" : undefined,
});

export default StoreList;