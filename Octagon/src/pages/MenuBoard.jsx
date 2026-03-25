export default function MenuBoard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', height: '100vh' }}>
      <header style={{ borderBottom: '2px solid #555', paddingBottom: '10px' }}>
        <h1>Live Menu Board</h1>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        <p>Today's Specials and Current Weather.</p>
        {/* TODO: Add Weather API integration and non-interactive menu display */}
      </main>
    </div>
  );
}