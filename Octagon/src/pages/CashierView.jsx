export default function CashierView() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1>Cashier POS</h1>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        <p>Touchscreen interface for ringing up bubble tea orders.</p>
        {/* TODO: Add grid of menu items and current order ticket */}
      </main>
    </div>
  );
}