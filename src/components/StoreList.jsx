import React, { useEffect, useState } from "react";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query) {
      fetchStoreSuggestions(query);
      setStores([]);
      setPage(1);
      fetchStores(query, 1);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchStoreSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://locoshop-backend.onrender.com/api/stores/suggestions?q=${searchQuery}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchStores = async (searchQuery, pageNum) => {
    try {
      const response = await fetch(
        `https://locoshop-backend.onrender.com/api/stores/search?q=${searchQuery}&page=${pageNum}`
      );
      const data = await response.json();

      if (pageNum === 1) {
        setStores(data);
      } else {
        setStores((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 3);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    fetchStores(query, nextPage);
    setPage(nextPage);
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1rem",
        position: "relative",
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search for a store (e.g., bike repair, puncture)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "5px",
        }}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            border: "1px solid #ccc",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: "#fff",
            zIndex: 999,
            position: "absolute",
            width: "100%",
          }}
        >
          {suggestions.map((sug, index) => (
            <div
              key={index}
              onClick={() => {
                setQuery(sug.name || sug.tags[0]);
                setShowSuggestions(false);
              }}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {sug.name || sug.tags.join(", ")}
            </div>
          ))}
        </div>
      )}

      {/* Store Cards */}
      {stores.map((store) => (
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
          <h2 style={{ margin: "0 0 10px", color: "#333" }}>{store.name}</h2>
          <p style={{ margin: "0 0 6px", color: "#555" }}>{store.address}</p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Call */}
            <a
              href={`tel:${store.phone}`}
              title="Call"
              style={{
                padding: "8px 10px",
                backgroundColor: "#e0f7fa",
                borderRadius: "8px",
                color: "#00796b",
                textDecoration: "none",
              }}
            >
              📞 Call
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/91${store.phone.replace(/^0+/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              style={{
                padding: "8px 10px",
                backgroundColor: "#dcf8c6",
                borderRadius: "8px",
                color: "#25D366",
                textDecoration: "none",
              }}
            >
              💬 Chat
            </a>

            {/* Directions */}
            <a
              href={
                store.latitude && store.longitude
                  ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              title="Get Directions"
              style={{
                padding: "8px 10px",
                backgroundColor: "#e8eaf6",
                borderRadius: "8px",
                color: "#3f51b5",
                textDecoration: "none",
              }}
            >
              🧭 Direction
            </a>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default StoreList;
