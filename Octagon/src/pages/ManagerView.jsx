export default function ManagerView() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1>Manager Dashboard</h1>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        <p>Welcome to the secure manager area.</p>
        {/* TODO: Add Google OAuth Login here */}
        {/* TODO: Fetch and display PostgreSQL inventory data via Express backend */}
      </main>
    </div>
  );
}