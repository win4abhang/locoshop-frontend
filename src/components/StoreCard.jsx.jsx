<div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
  <a href={`tel:${store.phone}`} title="Call" target="_blank" rel="noopener noreferrer">
    📞
  </a>
  <a href={`https://wa.me/${store.phone}`} title="WhatsApp" target="_blank" rel="noopener noreferrer">
    💬
  </a>
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}&destination_place_id=${store.name}`}
    title="Directions"
    target="_blank"
    rel="noopener noreferrer"
  >
    📍
  </a>
</div>
