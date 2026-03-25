export default function CustomerKiosk() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1>Self-Service Kiosk</h1>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        <p>Welcome! Tap to order your custom bubble tea.</p>
        {/* TODO: Implement WCAG 2.1 accessibility features and translation API */}
      </main>
    </div>
  );
}