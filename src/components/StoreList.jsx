import React, { useEffect, useState } from "react";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [waitingForLocation, setWaitingForLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setStores([]);
      setPage(1);
      fetchStores(query || "advertisement", 1, location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setStores([]);
      setPage(1);
      fetchStores(query || "advertisement", 1, location.latitude, location.longitude);
    }
  }, [query]);

  const fetchStores = async (searchQuery, pageNum, lat, lng) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://locoshop-backend.onrender.com/api/stores/searchStores?q=${searchQuery}&page=${pageNum}&latitude=${lat}&longitude=${lng}`
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
    fetchStores(query || "advertisement", nextPage, location.latitude, location.longitude);
  };

  const isValidPhone = (phone) => phone && phone !== "nan" && phone !== "0";

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

      <input
        type="text"
        placeholder="🔍 Search (e.g., bike repair, puncture)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "1rem",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      {location.latitude && location.longitude && (
        <p
          style={{
            fontSize: "0.9rem",
            textAlign: "center",
            color: "#555",
            marginBottom: "10px",
          }}
        >
          Your location: 📍 Latitude {location.latitude.toFixed(5)}, Longitude{" "}
          {location.longitude.toFixed(5)}
        </p>
      )}

      {isLoading && <p style={{ textAlign: "center" }}>Loading nearby stores...</p>}

      {stores.map((store) => {
        const distance = getDistance(
          location.latitude,
          location.longitude,
          store.latitude,
          store.longitude
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
            <h2
              style={{
                margin: "0 0 10px",
                color: "#333",
                fontSize: "1.2rem",
              }}
            >
              {store.name}{" "}
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                ({distance} km)
              </span>
            </h2>
            <p style={{ margin: "0 0 6px", color: "#555", fontSize: "0.95rem" }}>
              {store.address}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {isValidPhone(store.phone) && (
                <>
                  <a
                    href={`tel:${store.phone}`}
                    style={buttonStyle("#e0f7fa", "#00796b")}
                  >
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
                  store.latitude && store.longitude
                    ? window.open(
                        `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`,
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

      {hasMore && (
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
