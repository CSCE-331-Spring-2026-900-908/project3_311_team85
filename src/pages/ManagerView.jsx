const mockInventory = [
  { id: 101, item: 'Tapioca Pearls', stock: '15 lbs', status: 'Good' },
  { id: 102, item: 'Black Tea Leaves', stock: '2 lbs', status: 'Low' },
  { id: 103, item: 'Whole Milk', stock: '10 gal', status: 'Good' },
  { id: 104, item: 'Taro Powder', stock: '0.5 lbs', status: 'Reorder' },
];

export default function ManagerView() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Manager Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Inventory Management</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Item Name</th>
            <th style={{ padding: '12px' }}>Current Stock</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockInventory.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{row.id}</td>
              <td style={{ padding: '12px' }}>{row.item}</td>
              <td style={{ padding: '12px' }}>{row.stock}</td>
              <td style={{ padding: '12px', color: row.status === 'Reorder' ? 'red' : 'inherit' }}>
                <strong>{row.status}</strong>
              </td>
              <td style={{ padding: '12px' }}>
                <button style={{ padding: '6px 12px', cursor: 'pointer' }}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}