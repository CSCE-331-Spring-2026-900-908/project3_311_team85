const featuredItems = [
  { name: 'Brown Sugar Boba', description: 'Our signature slow-cooked tapioca with organic milk.', price: '$5.50' },
  { name: 'Matcha Latte', description: 'Premium ceremonial grade matcha.', price: '$5.00' },
  { name: 'Taro Slush', description: 'Ice blended sweet taro root.', price: '$5.25' },
];

export default function MenuBoard() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#111', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #aa3bff', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>Menu</h1>
        <div style={{ fontSize: '24px', color: '#aaa' }}>
          {/* Weather API will go here */}
          🌤️ 75°F College Station
        </div>
      </header>
      
      <main style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {featuredItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: '30px', borderRadius: '16px', transition: 'transform 0.1s' }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
            <div>
              <h2 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#aa3bff' }}>{item.name}</h2>
              <p style={{ fontSize: '20px', color: '#ccc', margin: 0 }}>{item.description}</p>
            </div>
            <span style={{ fontSize: '42px', fontWeight: 'bold' }}>{item.price}</span>
          </div>
        ))}
      </main>
    </div>
  );
}